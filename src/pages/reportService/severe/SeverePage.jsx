import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // navigate 사용
import NavBar from '../../../component/NavBar';
import { getToken } from '../../../utils/auth';
import { useLocation } from 'react-router-dom';
import './SeverePage.css';

/* global Tmapv2 */ // Tmapv2 전역 변수 선언
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const TMAP_API_KEY = process.env.REACT_APP_TMAP_API;

const SeverePage = () => {
    const location = useLocation();
    const { address } = location.state || {};
    const [emergencyRooms, setEmergencyRooms] = useState([]);   // 응급실 정보 목록 리스트
    const [dutyNames, setDutyNames] = useState([]);     // 응급실 기관명 리스트

    // T-map 관련 변수
    const mapInstance = useRef(null); // useRef로 mapInstance 선언
    const [startlat, setStartlat] = useState(null);     // 환자 위치: 위도
    const [startlon, setStartlon] = useState(null);   // 환자 위치: 경도
    const [markerArr, setMarkerArr] = useState([]);     // 지도 마커 리스트
    const [distances, setDistances] = useState([]);     // 주행 거리 리스트
    const [locations, setLocations] = useState([]); // 기관명, 위도, 경도 데이터 저장

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate(); // navigate 선언
    const [selectedER, setSelectedER] = useState(null); // 선택된 병원 상태
    
    // 도시, 구, 도로명주소 분리
    const parts = address.split(' ');
    const city = parts[0];
    const district = parts[1];
    const streetAndNumber = parts.slice(2).join(' ');

    // 도시 구 주변 응급실 검색 함수
    const GetEmergencyInfo = useCallback(async () => {
        const token = getToken();
        try {
            const response = await fetch(`${BACKEND_URL}/api/v1/api/getEmergencyInfo?stage1=${city}&stage2=${district}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Bearer 토큰 형식으로 전달
                },
            });

            if (!response.ok) throw new Error("데이터 요청에 실패했습니다.");

            const data = await response.json();
            console.log(response);
            if (data && data.response && data.response.body && data.response.body.items) {
                const items = data.response.body.items.item;
                console.log(items);
                // 응답 데이터가 배열인지 확인 후 상태 업데이트
                if (Array.isArray(items)) {
                    setEmergencyRooms(items);
                    const names = items.map(item => item.dutyName);
                    setDutyNames(names);
                } else if (items) {
                    setEmergencyRooms([items]); // 배열이 아니면 배열로 감싸기
                    setDutyNames([items.dutyName]);
                } else {
                    setEmergencyRooms([]); // 데이터가 없을 때 빈 배열
                }
                setError(null);
                } else {
                    setEmergencyRooms([]); // 데이터가 없으면 빈 배열 설정
                    setDutyNames([]); // items가 유효하지 않은 경우 빈 배열 설정
                    setError("데이터가 없습니다.");
              }
            } catch (error) {
                console.error("API 요청 중 오류 발생:", error);
                setError("데이터 요청 중 오류가 발생했습니다.");
                setEmergencyRooms([]);
            } finally {
                setLoading(false);
            }
    }, [city, district]);

    // 응급실 정보 먼저 불러옴
    useEffect(() => {
        GetEmergencyInfo();
    }, [GetEmergencyInfo]);  // GetEmergencyInfo에 의존하도록 설정

    // 지도 초기화 함수 (추천 과목을 받은 후에 실행)
    const initializeMap = useCallback(() => {
        if (!emergencyRooms) return; // 응급실 정보가 없으면 지도 초기화하지 않음

        const mapDiv = document.getElementById('mapContainer');
        if (mapDiv && !mapDiv.firstChild && window.Tmapv2) {
            mapInstance.current = new Tmapv2.Map("mapContainer", {
                center: new Tmapv2.LatLng(37.5665, 126.9780),
                width: "700px",
                height: "500px",
                zoom: 14
            });

            if (address) {
                const geocodeUrl = `https://apis.openapi.sk.com/tmap/geo/geocoding?version=1&format=json&city_do=${encodeURIComponent(city)}&gu_gun=${encodeURIComponent(district)}&dong=${encodeURIComponent(streetAndNumber)}&addressFlag=F00&coordType=WGS84GEO&appKey=${TMAP_API_KEY}`;
                fetch(geocodeUrl)
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        if (data.coordinateInfo && data.coordinateInfo.newLat && data.coordinateInfo.newLon) {
                            const lat = parseFloat(data.coordinateInfo.newLat);
                            const lon = parseFloat(data.coordinateInfo.newLon);
                            setStartlat(lat);
                            setStartlon(lon);
                            
                            mapInstance.current.setCenter(new Tmapv2.LatLng(lat, lon));

                            new Tmapv2.Marker({
                                position: new Tmapv2.LatLng(lat, lon),
                                icon: "http://tmapapi.tmapmobility.com/upload/tmap/marker/pin_b_m_p.png",
                                iconSize: new Tmapv2.Size(24, 38),
                                map: mapInstance.current,
                            });
                        } else {
                            alert("환자 위치의 좌표를 찾을 수 없습니다.");
                        }
                    })
                    .catch(error => {
                        console.error("지오코딩 중 오류 발생:", error);
                    });
            } else {
                console.error("환자 위치가 제공되지 않았습니다.");
            }
        } else if (!window.Tmapv2) {
            console.error("Tmap API가 로드되지 않았습니다.");
        }
    }, [address, city, district, streetAndNumber, emergencyRooms]);

    // 주행 거리 계산 함수
    const calculateDrivingDistance = async (startLat, startLon, endLat, endLon) => {
        const headers = {
            'appKey': TMAP_API_KEY,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };

        const url = `https://apis.openapi.sk.com/tmap/routes?version=1&format=json`;

        // 요청 본문 데이터
        const body = JSON.stringify({
            startX: startLon,
            startY: startLat,
            endX: endLon,
            endY: endLat,
            reqCoordType: "WGS84GEO",
            resCoordType: "WGS84GEO",
        });

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: body
            });
            
            // HTTP 상태 코드가 200이 아니면 오류 처리
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            
            // 거리 정보가 있으면 반환
            if (data.features && data.features.length > 0) {
                const distance = data.features[0].properties.totalDistance / 1000;
                return distance.toFixed(3);
            } else {
                throw new Error("No valid route data found.");
            }
        } catch (error) {
            console.error("Error calculating driving distance:", error);
            return null;
        }
    };

    // 기관명을 기반으로 위치를 검색하고 마커를 추가하며 주행 거리를 계산하는 함수
    const searchAndMarkPois = async () => {
        // 기존 마커 및 거리 정보 초기화
        markerArr.forEach(marker => marker.setMap(null));
        setMarkerArr([]);
        setDistances([]);
        setLocations([]); // 위치 데이터 초기화

        const distanceResults = []; // 거리 결과를 임시 저장할 배열
        const locationResults = []; // 위치 데이터 결과를 임시 저장할 배열

        for (const dutyname of dutyNames) {
            const url = `https://apis.openapi.sk.com/tmap/pois?version=1&searchKeyword=${encodeURIComponent(dutyname)}&searchType=all&searchtypCd=A&page=1&count=1&reqCoordType=WGS84GEO&resCoordType=WGS84GEO&appKey=${TMAP_API_KEY}`;
            try {
                const response = await fetch(url);
                const data = await response.json();

                if (data.searchPoiInfo && data.searchPoiInfo.pois.poi.length > 0) {
                    const poi = data.searchPoiInfo.pois.poi[0];
                    const lat = parseFloat(poi.noorLat);
                    const lon = parseFloat(poi.noorLon);
                    console.log(lat, lon);

                    // 주행 거리 계산 함수 호출
                    const distance = await calculateDrivingDistance(startlat, startlon, lat, lon);
                    console.log(distance);

                    // 마커 생성 및 지도에 추가
                    const marker = new Tmapv2.Marker({
                        position: new Tmapv2.LatLng(lat, lon),
                        icon: "http://tmapapi.tmapmobility.com/upload/tmap/marker/pin_r_m_p.png",
                        iconSize: new Tmapv2.Size(24, 38),
                        title: `${dutyname} (${distance} km)`,
                        map: mapInstance.current,
                    });

                    // 마커 리스트에 추가
                    setMarkerArr(prev => [...prev, marker]);
                    // 위치 데이터 추가
                    locationResults.push({ dutyname, lat, lon });

                    if (distance !== null) {
                        distanceResults.push({ dutyname, distance });
                    }
                    console.log(distances);
                } else {
                    console.error(`"${dutyname}"에 대한 위치 정보를 찾을 수 없습니다.`);
                }
            } catch (error) {
                console.error(`"${dutyname}"에 대한 위치 정보 요청 중 오류 발생:`, error);
            }
        }

        // 거리 상태 업데이트
        setDistances(distanceResults);
        setLocations(locationResults); // 위치 데이터 저장
    };

    // 지도 초기화 및 마커 업데이트
    useEffect(() => {
        if (emergencyRooms) {
            if (!window.Tmapv2) {
                const script = document.createElement('script');
                script.src = `https://apis.openapi.sk.com/tmap/jsv2?version=1&appKey=${TMAP_API_KEY}`;
                script.async = true;
                script.onload = () => {
                    initializeMap();
                };
                document.head.appendChild(script);
            } else {
                initializeMap();
            }
        }
    }, [initializeMap, emergencyRooms]);

    // 지도 인스턴스가 초기화된 후에만 마커 추가
    useEffect(() => {
        if (mapInstance.current && startlat !== null && startlon !== null) {
            searchAndMarkPois();
        }
    }, [startlat, startlon, mapInstance.current, dutyNames]); // 지도 초기화 후 실행


    if (loading) return <p>데이터를 불러오는 중입니다...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <NavBar />
            <div className="severe-diagnosis-page">
                <div className="severe-title-area">
                    <h1 className="page-title">증상 기반 진단결과: 중증</h1>
                    <p className="page-subtitle">{city} {district} 주변 응급실을 확인해보세요.</p>
                </div>
                <div className="severe-content-container">
                    <div className="map-container" id="mapContainer"></div>
                    
                    <div className="emergency-room-list">
                    <h3>* 5,000개 이상 구급 출동 데이터로 학습된 인공지능 모델이 거리에 따른 소요시간을 예측합니다.</h3>
                        {emergencyRooms.length > 0 ? (
                            emergencyRooms.map((er, index) => {
                                const matchedDistance = distances.find(distance => distance.dutyname === er.dutyName);
                                return (
                                    <div className="emergency-room-card" 
                                    key={index}
                                    onClick={() => setSelectedER(er)}
                                    style={{ border: selectedER?.dutyName === er.dutyName ? "2px solid #007bff" : "1px solid #ccc" }}
                                    >
                                        <h2 className="emergency-room-name">{er.dutyName}</h2>
                                        <p className="emergency-room-details">
                                            입력일시: {`${String(er.hvidate).slice(0, 4)}-${String(er.hvidate).slice(4, 6)}-${String(er.hvidate).slice(6, 8)} ${String(er.hvidate).slice(8, 10)}:${String(er.hvidate).slice(10, 12)}:${String(er.hvidate).slice(12, 14)}`}
                                        </p>
                                        <p className="emergency-room-details">응급실: {er.hvec}</p>
                                        <p className="emergency-room-details">수술실: {er.hvoc}</p>
                                        <p className="emergency-room-details">구급차 가용 여부: {er.hvamyn}</p>
                                        <p className="emergency-room-details">응급실 전화: {er.dutyTel3}</p>
                                        <p className="emergency-room-details">
                                            거리: {matchedDistance ? `${matchedDistance.distance} km` : "정보 없음"}
                                        </p>
                                    </div>
                                );
                            })
                        ) : (
                        !loading && <p>응급실 정보가 없습니다.</p>
                        )}
                        <button 
                            className="select-button" 
                            onClick={() => {
                                if (selectedER) {
                                    const matchedLocation = locations.find(location => location.dutyname === selectedER.dutyName);
                                    const matchedDistance = distances.find(distance => distance.dutyname === selectedER.dutyName);
                        
                                    if (matchedLocation) {
                                        const hospitalLat = matchedLocation.lat;
                                        const hospitalLon = matchedLocation.lon;
                                        const roadDistance = matchedDistance ? matchedDistance.distance : null;
                        
                                        navigate('/route/guide', {
                                            state: {
                                                patientLat: startlat,
                                                patientLon: startlon,
                                                hospitalLat,
                                                hospitalLon,
                                                roadDistance,
                                                selectedHospital: selectedER.dutyName,
                                                address,
                                            },
                                        });
                                    } else {
                                        alert("병원의 위치 정보를 찾을 수 없습니다.");
                                    }
                                } else {
                                    alert("병원을 선택해주세요!");
                                }
                            }}
                        >
                        선택하기
                        </button>
                    </div>
                </div>
                
            </div>
        </div>
    );
};

export default SeverePage;