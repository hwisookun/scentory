// Onboarding (single step — step 3 of 5, price range survey)
function ScreenOnboarding({onDone, onSkip}) {
  const [pick, setPick] = React.useState(1);
  const options = [
    {v:0, lbl:'5만원 이하', desc:'부담 없이 시도해볼 수 있어요'},
    {v:1, lbl:'5~15만원', desc:'다양한 브랜드, 합리적인 선택'},
    {v:2, lbl:'15~30만원', desc:'고급 브랜드, 퀄리티 있는 향'},
    {v:3, lbl:'30만원 이상', desc:'니치·명품 라인의 시그니처'},
    {v:4, lbl:'상관 없어요', desc:'가격은 따지지 않고 추천 받을게요'},
  ];
  return (
    <React.Fragment>
      <div style={{padding:'8px 16px 4px',display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
        <button onClick={onSkip} style={{background:'none',border:'none',padding:6,cursor:'pointer',color:S.text,display:'flex'}}>
          <Icon name="back" size={22}/>
        </button>
        <div style={{flex:1,height:6,background:S.gray200,borderRadius:9999}}>
          <div style={{width:'60%',height:'100%',background:S.primaryDark,borderRadius:9999,transition:'width .3s'}}/>
        </div>
        <span style={{fontSize:12,color:S.textSec,fontWeight:700,minWidth:32,textAlign:'right'}}>3/5</span>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'16px 20px 20px'}}>
        <div style={{fontSize:22,fontWeight:900,color:S.text,letterSpacing:-.4,lineHeight:1.3,marginBottom:6}}>
          어느 가격대가<br/>편하세요?
        </div>
        <div style={{fontSize:13,color:S.textSec,marginBottom:22}}>
          선택한 가격대의 브랜드예요 · 복수 선택 가능
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {options.map(o => {
            const sel = pick === o.v;
            return (
              <button key={o.v} onClick={()=>setPick(o.v)}
                style={{background: sel?S.secondary:S.white,
                  border:`1.5px solid ${sel?S.primaryDark:S.border}`, textAlign:'left',
                  borderRadius:14, padding:'14px 16px', cursor:'pointer',fontFamily:'inherit',
                  display:'flex',alignItems:'center',gap:12,boxShadow:sel?'none':S.shadowSm}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:700,color:sel?S.primaryDark:S.text}}>{o.lbl}</div>
                  <div style={{fontSize:12,color:S.textSec,marginTop:3}}>{o.desc}</div>
                </div>
                <div style={{width:22,height:22,borderRadius:9999,
                  border:`1.5px solid ${sel?S.primaryDark:S.gray300}`,
                  background:sel?S.primaryDark:'transparent',
                  display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:13}}>
                  {sel && '✓'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{padding:'10px 20px 20px',flexShrink:0}}>
        <button onClick={onDone}
          style={{width:'100%',height:52,borderRadius:16,border:'none',background:S.primaryDark,
            color:'#fff',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'inherit',boxShadow:S.shadowMd}}>
          다음
        </button>
      </div>
    </React.Fragment>
  );
}
Object.assign(window, {ScreenOnboarding});
