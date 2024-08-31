import React, {memo, useEffect, useMemo,  useState} from "react";
import {
    EditRoute, loadCompany, loadRoute,
    Route,
    RouteInfo,
    Station,
    Train,
    TrainType,
} from "../DiaData/DiaData";
import {getStationViewWidth, StationView} from './StationView';
import {getTripNameViewHeight, TripNameView} from './TripNameView';
import {TripView} from "./TripVIew";
import {useNavigate, useParams} from "react-router-dom";
import { StationHeaderView } from "./StationHeaderView";
import {BottomMenu} from "../Menu/BottomMenu";
import { HolizontalBoxList } from "./HolizontalBoxList";


export interface TimeTablePageSetting{
    fontSize:number,
    lineHeight:number,
}
export default function TimeTablePage() {
    const [stations, setStations] = useState<{[key:number]:Station}>({});
    const [trainTypes, setTrainTypes] = useState<{[key:number]:TrainType}>({});
    const [trains, setTrains] = useState<{[key:number]:Train}>({});
    const [routeInfo, setRouteInfo] = useState<{[key:number]:RouteInfo}>({});
    const [routes, setRoutes] = useState<{[key:number]:Route}>({});
    const navigate=useNavigate();
    const [setting,setSetting]=useState<TimeTablePageSetting>({
        fontSize:13,
        lineHeight:1.1
    });
    const MemoTripView = memo(TripView);
    const MemoTripNameView = memo(TripNameView);

    const param = useParams<{ routeID:string,direct: string  }>();
    const routeID=parseInt(param.routeID??"0");
    const direct=parseInt(param.direct??"0");



   useEffect(() => {
       loadCompany().then((company)=>{
           setStations(company.stations);
           // console.log(stations);
           setTrainTypes(company.trainTypes);
           setTrains(company.trains);
           setRouteInfo(company.routes);
       });
    }, []);
    useEffect(() => {
        const res=Object.values(routeInfo).find((routeInfo)=>{
            return routeInfo.name==="阪急宝塚本線";
        });
        if(routeID===0&&res!==undefined){
            navigate(`/TimeTable/${res.routeID}/${direct}`);
            return;
        }
        if(routes[routeID]===undefined){
            loadRoute(routeID).then((route)=>{
                EditRoute.sortTrips(route,0,0);
                setRoutes((prev)=>{
                    const next  = {...prev};
                    if(route!==undefined){
                        next[route.routeID]=route;
                    }
                    return next;
                })
            });
        }

    }, [routeInfo,routeID]);

    function getTrips() {
        if(direct===0){
            return routes[routeID].downTrips;
        }else{
            return routes[routeID].upTrips;
        }
    }
   //  useEffect(() => {
   //      window.onscroll=(e=>{
   //          requestAnimationFrame(()=>{
   //              console.log("test")
   //              const tripNameLayout=document.getElementById("tripNameLayout")
   //              if(tripNameLayout!==null){
   //                  tripNameLayout.style.left=-window.scrollX+"px";
   //              }
   //              if(stationViewLayout!==null){
   //                  stationViewLayout.style.top=-window.scrollY+"px";
   //              }
   //          });
   //      })
   // }, []);
    const getStationProps=useMemo(()=>{
        if(routes[routeID]===undefined){
            return [];
    }
        return routes[routeID].routeStations.map((item)=>{
            return {
                rsID:item.rsID,
                name:stations[item.stationID]?.name??"",
                style:item.showStyle
            }
        });
    },[routes,routeID,stations]);

    if(routes[routeID]===undefined){
        return (
            <div style={{fontSize: `${setting.fontSize}px`, lineHeight: `${setting.fontSize * setting.lineHeight}px`}}>
            <BottomMenu routeID={routeID} routeInfo={routeInfo}/>
            </div>
        )
    }
    const Column = ( index:number, style:any) => {
        const trip=getTrips()[index];
        return (
            <div key={trip.tripID} id='a' style={style}>
            <MemoTripView  trip={trip} type={trainTypes[trip.trainTypeID]}
                      setting={setting} stations={getStationProps} allStations={stations}
                      train={trains[trip.trainID]}

                      direction={direct}/>
            </div>
        );
    }
    const Column2 = (index:number, style:any) => {
        const trip=getTrips()[index];
        return (
            <div id="a"key={trip.tripID} style={{...style,height:`${getTripNameViewHeight(setting)}px`,borderBottom:'2px solid black'}}>
                <MemoTripNameView key={trip.tripID} trip={trip} type={trainTypes[trip.trainTypeID]}
                              setting={setting}
                              train={trains[trip.trainID]}
                              stations={stations}
                />

            </div>
        );
    }
    let setScrollX:undefined|((scrollX:number)=>void)=undefined;
    return (
        <div style={{width: '100%',height:'100%',fontSize: `${setting.fontSize}px`, lineHeight: `${setting.fontSize * setting.lineHeight}px`}}>
            <div style={{display: "flex", width: '100%', height: '100%', paddingBottom: "70px",zIndex:5}}>
                <div style={{
                    width: `${getStationViewWidth(setting)}px`,
                    borderRight: "2px solid black",
                    borderBottom: "2px solid black",
                    position: "fixed",
                    height: `${getTripNameViewHeight(setting)}px`,
                    background: "white",
                    zIndex: 20
                }}>
                    <StationHeaderView  setting={setting}/>
                </div>
                <div style={{
                    width: `${getStationViewWidth(setting)}px`,
                    borderRight: "2px solid black",
                    position: 'fixed',
                    zIndex:1,
                    paddingTop: `${getTripNameViewHeight(setting)}px`,
                    background: "white"
                }} id="stationViewLayout">
                    <StationView stations={getStationProps} setting={setting} direction={direct}/>
                </div>
                <div style={{width: '0px', flexShrink: 1, flexGrow: 1, paddingRight: '10px',
                display:'flex',flexDirection:'column'}}>
                    <div
                        style={{
                            paddingLeft: `${getStationViewWidth(setting)}px`,
                            overflowX: "hidden",
                            width: '100%',
                            height:getTripNameViewHeight(setting)
                        }}
                    >
                        <HolizontalBoxList
                            itemCount={getTrips().length}
                            itemSize={(setting.fontSize * 2.2)}
                            getSetScrollX={(_setScrollX)=> {
                                setScrollX=_setScrollX;
                            }
                            }
                        >
                            {Column2}
                        </HolizontalBoxList>
                    </div>

                    <div
                        style={{
                            flexGrow: 1,
                            height:0,
                            paddingLeft: `${getStationViewWidth(setting)}px`,
                            // paddingTop: `${getTripNameViewHeight(setting)}px`,
                            overflowX: "hidden",
                            width: '100%',
                        }}
                    >
                        <HolizontalBoxList
                                           itemCount={getTrips().length}
                                           itemSize={(setting.fontSize * 2.2)}
                                           onScroll={(_scrollX, scrollY)=>{
                                               const stationViewLayout=document.getElementById("stationViewLayout")
                                                  if(stationViewLayout!==null){
                                                    stationViewLayout.style.top=-scrollY+"px";
                                                  }
                                                  if(setScrollX!==undefined) {
                                                      setScrollX(_scrollX);
                                                  }
                                                }
                                            }
                                           >
                            {Column}
                        </HolizontalBoxList>
                    </div>

                </div>
            </div>
                <BottomMenu routeID={routeID} routeInfo={routeInfo}/>
        </div>
    );
}