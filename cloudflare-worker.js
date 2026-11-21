/**
 * KAFV Weather API Connection Test - Cloudflare Worker
 * 실제 기상청 초단기실황 API 프록시 (data.go.kr 승인 키 필요)
 * Dashboard secret variable: KMA_SERVICE_KEY = 공공데이터포털에서 발급한 '일반 인증키(Decoding)'
 * 주의: 인증키를 이 소스 파일에 작성하거나 GitHub에 올리지 않습니다.
 */
const CITY_GRID = Object.freeze({
  busan:{name:'부산',nx:98,ny:76},
  seoul:{name:'서울',nx:60,ny:127},
  daejeon:{name:'대전',nx:67,ny:100},
  daegu:{name:'대구',nx:89,ny:90},
  gwangju:{name:'광주',nx:58,ny:74},
  jeju:{name:'제주',nx:52,ny:38}
});
const API_URL = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';
const ALLOWED_ORIGIN = 'https://jongcheon-kim.github.io';
const HEADERS = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Access-Control-Allow-Origin':ALLOWED_ORIGIN,'Vary':'Origin'};
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:HEADERS})}
function slot(hoursAgo){const d=new Date(Date.now()+9*3600000);d.setUTCHours(d.getUTCHours()-hoursAgo,0,0,0);const str=d.toISOString();return {date:str.slice(0,10).replaceAll('-',''),time:str.slice(11,13)+'00'}}
function num(raw){if(raw===undefined||raw===null||String(raw).trim()==='')return null;const v=Number(raw);return Number.isFinite(v)?v:null}
export default {
 async fetch(request,env){
  const u=new URL(request.url);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...HEADERS,'Access-Control-Allow-Methods':'GET, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'3600'}});
  if(request.method!=='GET')return json({ok:false,message:'GET 요청만 지원합니다.'},405);
  if(u.pathname==='/health')return json({ok:true,service:'kafv-weather-test',mode:'live-worker',configured:!!env.KMA_SERVICE_KEY});
  if(u.pathname!=='/api/weather')return json({ok:false,message:'지원하지 않는 경로입니다. /health 또는 /api/weather?city=busan'},404);
  const city=u.searchParams.get('city')||'busan';
  const place=CITY_GRID[city];
  if(!place)return json({ok:false,message:'지원하지 않는 지역입니다.'},400);
  if(!env.KMA_SERVICE_KEY)return json({ok:false,message:'Cloudflare Worker 비밀 변수 KMA_SERVICE_KEY가 설정되지 않았습니다.'},503);
  const started=Date.now();
  try{
   let lastInfo='자료 없음';
   for(let hoursAgo=1;hoursAgo<=3;hoursAgo++){
    const s=slot(hoursAgo);
    const api=new URL(API_URL);
    api.searchParams.set('serviceKey',env.KMA_SERVICE_KEY); // Decoding 키 전달, URLSearchParams로 한 번만 인코딩
    api.searchParams.set('pageNo','1');
    api.searchParams.set('numOfRows','20');
    api.searchParams.set('dataType','JSON');
    api.searchParams.set('base_date',s.date);
    api.searchParams.set('base_time',s.time);
    api.searchParams.set('nx',String(place.nx));
    api.searchParams.set('ny',String(place.ny));
    const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),9000);
    let response,txt;
    try {response=await fetch(api.toString(),{signal:ctrl.signal,cf:{cacheTtl:180,cacheEverything:true}});txt=await response.text()}
    finally{clearTimeout(timer)}
    if(!response.ok){lastInfo='기상청 서버 HTTP '+response.status;continue}
    let payload;
    try{payload=JSON.parse(txt)}catch{lastInfo='API 응답 형식이 JSON이 아닙니다. 인증키 또는 API 설정 확인 필요';continue}
    const header=payload?.response?.header;
    if(!header || String(header.resultCode)!=='00'){
      lastInfo='기상청 API 오류: '+String(header?.resultCode||'UNKNOWN')+' '+String(header?.resultMsg||'');
      // 승인/인증 오류라면 다른 시간으로 재시도해도 같은 결과
      if(header && !['03','NO_DATA'].includes(String(header.resultCode)))break;
      continue;
    }
    const records=payload?.response?.body?.items?.item;
    const list=Array.isArray(records)?records:records?[records]:[];
    if(!list.length){lastInfo=`${s.date} ${s.time} 자료 0건`;continue}
    const values=Object.fromEntries(list.map(x=>[x.category,x.obsrValue]));
    if(!('T1H' in values)&&!('REH' in values)){lastInfo='요청은 성공했으나 주요 관측값이 없습니다.';continue}
    return json({ok:true,source:'기상청_단기예보 조회서비스 (초단기실황)',city,cityName:place.name,baseDate:s.date,baseTime:s.time,temperature:num(values.T1H),humidity:num(values.REH),rain1h:values.RN1??null,windSpeed:num(values.WSD),precipitationType:values.PTY??null,elapsedMs:Date.now()-started});
   }
   return json({ok:false,message:'기상청 자료를 가져오지 못했습니다. '+lastInfo},502);
  }catch(err){return json({ok:false,message:err?.name==='AbortError'?'기상청 서버 응답 시간 초과':'기상청 요청 중 통신 오류가 발생했습니다.'},502)}
 }
};
