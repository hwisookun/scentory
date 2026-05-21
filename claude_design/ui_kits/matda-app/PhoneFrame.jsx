// PhoneFrame + shared primitives
const phoneStyles = {
  stage: {
    minHeight:'100vh', background:'#1A2E24', display:'flex',
    alignItems:'center', justifyContent:'center', padding:'24px',
    fontFamily:"'Pretendard', -apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
  },
  bezel: {
    width:390, height:844, background:'#000', borderRadius:52,
    padding:10, position:'relative',
    boxShadow:'0 30px 60px rgba(0,0,0,.45), 0 0 0 2px #262a28 inset',
  },
  screen: {
    width:'100%', height:'100%', background:'#F7FAF8', borderRadius:42,
    overflow:'hidden', position:'relative', display:'flex', flexDirection:'column',
  },
  notch: {
    position:'absolute', top:10, left:'50%', transform:'translateX(-50%)',
    width:124, height:34, background:'#000', borderRadius:'0 0 20px 20px', zIndex:10,
  },
  status: {
    position:'relative', height:48, paddingTop:14,
    display:'flex', alignItems:'center', justifyContent:'space-between',
    padding:'14px 28px 0 28px', fontSize:14, fontWeight:700, color:'#1A2E24',
    flexShrink:0,
  },
  homeIndicator: {
    position:'absolute', bottom:8, left:'50%', transform:'translateX(-50%)',
    width:140, height:5, background:'#1A2E24', borderRadius:9999, opacity:.9,
    zIndex:15,
  },
  body: {flex:1, overflow:'hidden', display:'flex', flexDirection:'column'},
};

function PhoneFrame({children, time = '9:41'}) {
  return (
    <div style={phoneStyles.stage}>
      <div style={phoneStyles.bezel}>
        <div style={phoneStyles.screen}>
          <div style={phoneStyles.notch} />
          <div style={phoneStyles.status}>
            <span>{time}</span>
            <span style={{display:'inline-flex',gap:6,alignItems:'center',fontSize:12}}>
              <span>●●●●●</span>
              <span style={{fontSize:11}}>5G</span>
              <span style={{width:22,height:11,border:'1.5px solid #1A2E24',borderRadius:3,display:'inline-block',position:'relative'}}>
                <span style={{position:'absolute',inset:1,background:'#1A2E24',width:'82%',borderRadius:1}}></span>
              </span>
            </span>
          </div>
          <div style={phoneStyles.body}>{children}</div>
          <div style={phoneStyles.homeIndicator} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {PhoneFrame});
