// Community (커뮤니티)
function ScreenCommunity() {
  const posts = [
    {id:1, user:'향덕후_미소', avatar:'#FCE4EC', time:'2시간 전', tag:'플로럴',
     title:'요즘 최애 플로럴, 같이 얘기해요',
     body:'봄이라 그런지 더 자주 손이 가네요. 피오니 계열 중에 추천 있으세요?',
     likes:24, comments:12},
    {id:2, user:'scent_j', avatar:'#EBF7F1', time:'5시간 전', tag:'데이트',
     title:'첫 데이트에 뭘 뿌리시나요?',
     body:'너무 진하지도, 너무 약하지도 않은 향으로 추천 받고 싶어요. EDP 추천 받습니다.',
     likes:41, comments:23},
    {id:3, user:'민트초코', avatar:'#FFF3E0', time:'어제', tag:'질문',
     title:'지속력이 가장 좋은 우디 향수?',
     body:'출근용으로 오래 가는 우디 계열 찾고 있어요.',
     likes:15, comments:8},
  ];
  const [filter, setFilter] = React.useState('전체');
  const filters = ['전체','플로럴','데이트','질문','정보','자랑'];
  return (
    <React.Fragment>
      <TopBar title="커뮤니티" right={[
        <button key="w" style={{background:'none',border:'none',padding:6,cursor:'pointer',color:S.primaryInk,display:'flex'}}>
          <Icon name="plus" size={22}/>
        </button>
      ]}/>
      <div style={{display:'flex',gap:6,padding:'0 16px 10px',overflowX:'auto',scrollbarWidth:'none',flexShrink:0}}>
        {filters.map(f => (
          <SortPill key={f} active={filter===f} onClick={()=>setFilter(f)}>{f}</SortPill>
        ))}
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'4px 16px 20px'}}>
        {posts.map(p => (
          <div key={p.id} style={{background:S.white,borderRadius:16,padding:16,marginBottom:10,boxShadow:S.shadowSm}}>
            <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:10}}>
              <div style={{width:32,height:32,borderRadius:9999,background:p.avatar}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:S.text}}>{p.user}</div>
                <div style={{fontSize:11,color:S.textLight,marginTop:1}}>{p.time}</div>
              </div>
              <span style={{fontSize:10,fontWeight:700,color:S.primaryInk,background:S.secondary,
                padding:'3px 8px',borderRadius:9999}}>#{p.tag}</span>
            </div>
            <div style={{fontSize:15,fontWeight:700,color:S.text,marginBottom:4,lineHeight:1.3}}>{p.title}</div>
            <div style={{fontSize:13,color:S.textSec,lineHeight:1.55,marginBottom:12}}>{p.body}</div>
            <div style={{display:'flex',gap:16,fontSize:12,color:S.textSec,fontWeight:600}}>
              <span style={{display:'inline-flex',gap:4,alignItems:'center'}}><Icon name="heart" size={14}/>{p.likes}</span>
              <span style={{display:'inline-flex',gap:4,alignItems:'center'}}><Icon name="chat" size={14}/>{p.comments}</span>
            </div>
          </div>
        ))}
      </div>
    </React.Fragment>
  );
}
Object.assign(window, {ScreenCommunity});
