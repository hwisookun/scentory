// Login screen
function ScreenLogin({onLogin}) {
  return (
    <React.Fragment>
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',
        padding:'56px 32px 32px',
        background:`linear-gradient(to bottom, ${S.primaryLight} 0%, ${S.secondary} 40%, ${S.bg} 75%)`}}>

        <div style={{marginTop:24,textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:14}}>
          <HyangiAvatar size={140} bob sparkles/>
          <div style={{marginTop:4}}>
            <Logotype size={56}/>
          </div>
          <div style={{fontSize:14,color:S.textSec,marginTop:2,lineHeight:1.65,fontWeight:500}}>
            나의 향, 나의 기억<br/>
            <span style={{fontSize:12,color:S.textLight}}>나에게 꼭 맞는 향수를 찾아보세요</span>
          </div>
        </div>

        <div style={{marginTop:'auto',width:'100%',display:'flex',flexDirection:'column',gap:10}}>
          <button onClick={()=>onLogin('kakao')}
            style={{height:52,borderRadius:16,border:'none',background:'#FEE500',color:'#1A1A1A',
              fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'inherit',display:'flex',
              alignItems:'center',justifyContent:'center',gap:8,boxShadow:S.shadowSm}}>
            <span style={{fontSize:18}}>💬</span>카카오로 계속하기
          </button>
          <button onClick={()=>onLogin('naver')}
            style={{height:52,borderRadius:16,border:'none',background:'#03C75A',color:'#fff',
              fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'inherit',display:'flex',
              alignItems:'center',justifyContent:'center',gap:8,boxShadow:S.shadowSm}}>
            <span style={{background:'#fff',color:'#03C75A',width:18,height:18,borderRadius:4,
              fontSize:12,fontWeight:900,display:'inline-flex',alignItems:'center',justifyContent:'center'}}>N</span>
            네이버로 계속하기
          </button>
          <button onClick={()=>onLogin('google')}
            style={{height:52,borderRadius:16,border:`1px solid ${S.border}`,background:'#fff',color:S.text,
              fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'inherit',display:'flex',
              alignItems:'center',justifyContent:'center',gap:8,boxShadow:S.shadowSm}}>
            <span style={{fontSize:18}}>G</span>Google로 계속하기
          </button>

          <button onClick={()=>onLogin('guest')}
            style={{marginTop:6,padding:'14px',background:'none',border:'none',color:S.textSec,
              fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
            우선 들어갈래요 →
          </button>

          <div style={{fontSize:11,color:S.textLight,textAlign:'center',lineHeight:1.5,marginTop:4}}>
            계속 진행하면 <u>이용약관</u>과 <u>개인정보처리방침</u>에<br/>동의하는 것으로 간주됩니다.
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
Object.assign(window, {ScreenLogin});
