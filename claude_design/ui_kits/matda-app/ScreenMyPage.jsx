// MyPage (마이페이지)
function ScreenMyPage({liked, onLogout}) {
  const likedCount = Object.values(liked).filter(Boolean).length;
  return (
    <React.Fragment>
      <TopBar title="마이페이지" right={[
        <button key="s" style={{background:'none',border:'none',padding:6,cursor:'pointer',color:S.text,display:'flex'}}>
          <Icon name="notif" size={22}/>
        </button>
      ]}/>
      <div style={{flex:1,overflowY:'auto'}}>
        {/* Profile block */}
        <div style={{padding:'12px 16px 20px',display:'flex',gap:14,alignItems:'center',background:S.bg}}>
          <div style={{width:64,height:64,borderRadius:9999,background:S.secondary,
            display:'flex',alignItems:'center',justifyContent:'center',color:S.primaryInk,
            fontSize:24,fontWeight:800,boxShadow:S.shadowSm}}>
            M
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:17,fontWeight:800,color:S.text}}>미소님</div>
            <div style={{fontSize:12,color:S.textSec,marginTop:2}}>miso@matda.app</div>
            <div style={{display:'flex',gap:6,marginTop:6}}>
              <span style={{fontSize:10,fontWeight:700,color:S.primaryInk,background:S.secondary,
                padding:'3px 8px',borderRadius:9999}}>플로럴 러버</span>
              <span style={{fontSize:10,fontWeight:700,color:'#E91E63',background:'#FCE4EC',
                padding:'3px 8px',borderRadius:9999}}>봄·여름형</span>
            </div>
          </div>
          <Icon name="chevR" size={18} color={S.textLight}/>
        </div>

        {/* Stats row */}
        <div style={{display:'flex',padding:'0 16px 20px',gap:8}}>
          <StatCard label="위시리스트" value={likedCount}/>
          <StatCard label="리뷰" value={3}/>
          <StatCard label="팔로우" value={12}/>
        </div>

        {/* Menu */}
        <div style={{background:S.white,padding:'4px 0',margin:'0 16px',borderRadius:16,boxShadow:S.shadowSm}}>
          {[
            {icon:'heart',label:'내 향 취향',sub:'테스트 다시 하기'},
            {icon:'star',label:'내가 남긴 리뷰',sub:'3개'},
            {icon:'notif',label:'알림 설정',sub:null},
            {icon:'person',label:'계정 관리',sub:null},
          ].map((m,i,a)=>(
            <div key={m.label} style={{display:'flex',gap:14,alignItems:'center',padding:'14px 18px',
              borderBottom: i<a.length-1 ? `1px solid ${S.border}` : 'none',cursor:'pointer'}}>
              <span style={{color:S.primaryInk,display:'flex'}}><Icon name={m.icon} size={20}/></span>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,color:S.text}}>{m.label}</div>
                {m.sub && <div style={{fontSize:11,color:S.textLight,marginTop:2}}>{m.sub}</div>}
              </div>
              <Icon name="chevR" size={14} color={S.textLight}/>
            </div>
          ))}
        </div>

        <button onClick={onLogout} style={{margin:'18px 16px',padding:'12px 16px',background:'none',
          border:`1px solid ${S.border}`,color:S.textSec,fontSize:13,fontWeight:600,
          borderRadius:12,width:'calc(100% - 32px)',cursor:'pointer',fontFamily:'inherit'}}>
          로그아웃
        </button>
      </div>
    </React.Fragment>
  );
}

function StatCard({label, value}) {
  return (
    <div style={{flex:1,background:S.white,borderRadius:12,padding:'14px 8px',
      textAlign:'center',boxShadow:S.shadowSm}}>
      <div style={{fontSize:22,fontWeight:900,color:S.primaryInk,letterSpacing:-.5}}>{value}</div>
      <div style={{fontSize:11,color:S.textSec,marginTop:2,fontWeight:600}}>{label}</div>
    </div>
  );
}

Object.assign(window, {ScreenMyPage, StatCard});
