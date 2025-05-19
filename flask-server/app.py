from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import vt_graph_api
from dotenv import load_dotenv
import logging
import traceback
import socket
import nmap
import concurrent.futures
import time

# 로깅 설정
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# 환경 변수 로드
load_dotenv()

app = Flask(__name__)
CORS(app)

# API 키를 환경 변수에서 가져오기
VT_API_KEY = os.environ.get('VIRUSTOTAL_API_KEY')

# API 키 검증
if not VT_API_KEY:
    logger.warning("경고: VIRUSTOTAL_API_KEY 환경 변수가 설정되지 않았습니다.")

@app.route('/api/vt-graph', methods=['POST'])
@app.route('/vt-graph', methods=['POST'])
def create_vt_graph():
    try:
        if not VT_API_KEY:
            return jsonify({'error': 'VirusTotal API 키가 설정되지 않았습니다.'}), 500
        
        data = request.get_json()
        logger.debug(f"받은 요청 데이터: {data}")
        
        node_id = data.get('node_id')
        node_type = data.get('node_type', 'ip_address')
        
        logger.info(f"VT Graph 생성 요청: node_id={node_id}, node_type={node_type}")
        
        if not node_id:
            return jsonify({'error': '노드 ID가 필요합니다.'}), 400
        
        # VT Graph 객체 생성
        graph_name = f"분석: {node_id}"
        logger.debug(f"VTGraph 객체 생성 시작. API 키: {VT_API_KEY[:5]}...")
        
        graph = vt_graph_api.VTGraph(VT_API_KEY, name=graph_name, private=False)
        
        # 노드 추가
        logger.debug(f"노드 추가 중: {node_id}")
        graph.add_node(node_id, node_type, fetch_information=True)
        
        # 한 단계 확장하여 관련 노드 추가
        logger.debug(f"그래프 확장 중...")
        try:
            graph.expand_one_level(node_id, max_nodes_per_relationship=10)
        except KeyError as ke:
            logger.warning(f"그래프 확장 중 KeyError 발생: {str(ke)}. 이 오류는 무시하고 계속 진행합니다.")
            # 키 오류가 발생해도 계속 진행
        except Exception as e:
            logger.warning(f"그래프 확장 중 오류 발생: {str(e)}. 이 오류는 무시하고 계속 진행합니다.")
        
        # 그래프 저장
        logger.debug("그래프 저장 중...")
        graph.save_graph()
        
        # iframe과 링크 생성
        iframe_code = graph.get_iframe_code()
        ui_link = graph.get_ui_link()
        graph_id = graph.graph_id
        
        logger.info(f"VT Graph 생성 완료: graph_id={graph_id}")
        
        return jsonify({
            'success': True,
            'message': 'VT Graph 생성 완료',
            'graph_id': graph_id,
            'iframe_code': iframe_code,
            'ui_link': ui_link,
            'api_calls': graph.get_api_calls()
        })
    
    except Exception as e:
        logger.error(f"VT Graph 생성 중 오류 발생: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/vt-graph/<graph_id>', methods=['GET'])
@app.route('/vt-graph/<graph_id>', methods=['GET'])
def get_vt_graph(graph_id):
    try:
        if not VT_API_KEY:
            return jsonify({'error': 'VirusTotal API 키가 설정되지 않았습니다.'}), 500
        
        # 그래프 로드
        graph = vt_graph_api.VTGraph.load_graph(graph_id, VT_API_KEY)
        
        # iframe과 링크 생성
        iframe_code = iframe_code.replace('</iframe>', ' sandbox="allow-scripts allow-same-origin allow-popups"></iframe>')
        ui_link = graph.get_ui_link()
        
        return jsonify({
            'success': True,
            'graph_id': graph_id,
            'iframe_code': iframe_code,
            'ui_link': ui_link,
            'nodes_count': len(graph.nodes),
            'links_count': len(graph.links)
        })
    
    except Exception as e:
        logger.error(f"VT Graph 조회 중 오류 발생: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# 배너그랩 함수 정의
def grab_banner(ip, port, timeout=3):
    """지정된 IP와 포트에서 배너 정보를 가져옵니다."""
    try:
        # 소켓 객체 생성
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(timeout)
        
        # 연결 시도
        s.connect((ip, port))
        
        # 배너 정보 요청 (HTTP 요청 헤더)
        if port == 80 or port == 8080:
            s.send(b"GET / HTTP/1.1\r\nHost: " + ip.encode() + b"\r\n\r\n")
        elif port == 21:  # FTP
            pass  # 연결만으로 배너를 보내는 경우가 많음
        elif port == 22:  # SSH
            pass  # 연결만으로 배너를 보내는 경우가 많음
        elif port == 25:  # SMTP
            pass  # 연결만으로 배너를 보내는 경우가 많음
        
        # 응답 수신
        banner = s.recv(1024)
        s.close()
        
        # 바이너리를 문자열로 변환
        try:
            return banner.decode('utf-8').strip()
        except UnicodeDecodeError:
            return banner.decode('latin-1').strip()
    except socket.timeout:
        return "시간 초과"
    except ConnectionRefusedError:
        return "연결 거부됨"
    except Exception as e:
        logger.error(f"배너그랩 중 오류 발생: {str(e)}")
        return f"오류: {str(e)}"
    finally:
        try:
            s.close()
        except:
            pass

# 포트 스캔 함수 정의
def scan_ports(ip, port_range='21-25,80,443,8080-8090', timeout=3):
    """지정된 IP에서 포트 스캔을 실행합니다."""
    try:
        # nmap 스캐너 초기화
        scanner = nmap.PortScanner()
        
        # 포트 스캔 실행 (서비스 버전 감지 포함)
        scanner.scan(ip, port_range, arguments=f'-T4 --max-rtt-timeout {timeout}s -sV')
        
        result = {
            'open_ports': [],
            'filtered_ports': [],
            'closed_ports': []
        }
        
        # 결과 처리
        for host in scanner.all_hosts():
            for proto in scanner[host].all_protocols():
                lport = scanner[host][proto].keys()
                for port in lport:
                    port_data = scanner[host][proto][port]
                    port_info = {
                        'port': port,
                        'service': port_data['name'],
                        'state': port_data['state']
                    }
                    
                    # 서비스 버전 정보가 있으면 추가
                    if 'product' in port_data and port_data['product']:
                        service_info = port_data['product']
                        if 'version' in port_data and port_data['version']:
                            service_info += f" {port_data['version']}"
                        if 'extrainfo' in port_data and port_data['extrainfo']:
                            service_info += f" ({port_data['extrainfo']})"
                        port_info['service_detail'] = service_info
                    
                    # 열린 포트인 경우 배너 정보 추가
                    if port_info['state'] == 'open':
                        try:
                            banner = grab_banner(ip, port)
                            if banner:
                                port_info['banner'] = banner
                        except Exception as e:
                            logger.error(f"배너 가져오기 실패: {str(e)}")
                        result['open_ports'].append(port_info)
                    elif port_info['state'] == 'filtered':
                        result['filtered_ports'].append(port_info)
                    elif port_info['state'] == 'closed':
                        result['closed_ports'].append(port_info)
        
        # 포트 번호 순으로 정렬
        result['open_ports'].sort(key=lambda x: x['port'])
        result['filtered_ports'].sort(key=lambda x: x['port'])
        result['closed_ports'].sort(key=lambda x: x['port'])
        
        return result
    except Exception as e:
        error_message = str(e)
        logger.error(f"포트 스캔 중 오류 발생: {error_message}")
        
        # nmap 프로그램 찾지 못함 오류인 경우 더 명확한 메시지 반환
        if "nmap program was not found in path" in error_message:
            return {
                'error': "nmap이 설치되어 있지 않습니다. 시스템에 nmap을 설치한 후 다시 시도해주세요.",
                'open_ports': [],
                'filtered_ports': [],
                'closed_ports': []
            }
        
        return {
            'error': error_message,
            'open_ports': [],
            'filtered_ports': [],
            'closed_ports': []
        }

@app.route('/api/scan', methods=['POST'])
@app.route('/scan', methods=['POST'])
def scan_ip():
    """IP 주소에 대한 포트 스캔 및 배너그랩을 실행합니다."""
    try:
        data = request.get_json()
        logger.debug(f"스캔 요청 데이터: {data}")
        
        # 필수 파라미터 확인
        ip = data.get('ip')
        if not ip:
            return jsonify({'error': 'IP 주소가 필요합니다.'}), 400
        
        # 옵션 파라미터
        port_range = data.get('port_range', '21-25,80,443,8080-8090')
        timeout = data.get('timeout', 3)
        
        logger.info(f"스캔 시작: {ip}, 포트 범위: {port_range}")
        start_time = time.time()
        
        # 포트 스캔 수행
        scan_result = scan_ports(ip, port_range, timeout)
        
        # 소요 시간 계산
        elapsed_time = time.time() - start_time
        
        # 결과 반환
        return jsonify({
            'success': 'error' not in scan_result,
            'ip': ip,
            'scan_result': scan_result,
            'scan_time': f"{elapsed_time:.2f}초",
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        })
    
    except Exception as e:
        logger.error(f"스캔 처리 중 오류 발생: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e),
            'scan_result': {
                'error': str(e),
                'open_ports': [],
                'filtered_ports': [],
                'closed_ports': []
            }
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
