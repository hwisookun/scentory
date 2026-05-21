// Perfume detail
function ScreenPerfumeDetail({perfume, onBack, liked, toggleLike}) {
  const [tab, setTab] = React.useState('note');
  return (
    <React.Fragment>
      <TopBar onBack={onBack} title="" right={[
        <button key="h" onClick={()=>toggleLike(perfume.id)}
          style={{background:'none',border:'none',padding:6,cursor:'pointer',
            color: liked ? S.accent : S.text,display:'flex'}}>
          <Icon name="heart" size={22} solid={liked}/>
        </button>
      ]}/>
      <div style={{flex:1,overflowY:'auto'}}>
        {/* Hero */}
        <div style={{height:300,position:'relative',
          background:'linear-gradient(160deg, #F0F8F3 0%, #DCF1E2 100%)',
          display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{width:110,height:160,position:'relative'}}>
            <div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',
              width:54,height:19,background:'rgba(31,74,53,.55)',borderRadius:4}}/>
            <div style={{position:'absolute',top:19,left:'50%',transform:'translateX(-50%)',
              width:66,height:10,background:'rgba(31,74,53,.35)',borderRadius:2}}/>
            <div style={{position:'absolute',top:29,left:'50%',transform:'translateX(-50%)',
              width:100,height:130,background:'rgba(31,74,53,.22)',borderRadius:12}}/>
            <div style={{position:'absolute',top:40,left:18,width:18,height:96,
              background:'#fff',opacity:.45,borderRadius:9999,filter:'blur(1px)'}}/>
          </div>
          {perfume.niche && <span style={{position:'absolute',top:14,left:16,background:S.primaryDark,
            color:'#fff',fontSize:10,fontWeight:800,padding:'4px 10px',borderRadius:8,letterSpacing:.5}}>니치 향수</span>}
        </div>

        <div style={{padding:'20px 16px 10px'}}>
          <div style={{fontSize:11,color:S.primaryInk,fontWeight:800,textTransform:'uppercase',letterSpacing:.6}}>
            {perfume.brand}
          </div>
          <div style={{fontSize:22,fontWeight:800,color:S.text,letterSpacing:-.3,marginTop:4,lineHeight:1.25}}>
            {perfume.name}
          </div>
          <div style={{fontSize:13,color:S.textSec,marginTop:2}}>{perfume.nameKo}</div>
          <div style={{display:'flex',gap:6,marginTop:12,flexWrap:'wrap'}}>
            {perfume.tags.map(t=><ScentTag key={t} name={t}/>)}
          </div>
          <div style={{display:'flex',gap:16,marginTop:14,alignItems:'center'}}>
            <span style={{fontSize:20,fontWeight:900,color:S.text}}>{perfume.price.toLocaleString()}원</span>
            <span style={{fontSize:13,color:S.textSec,display:'inline-flex',alignItems:'center',gap:4,fontWeight:600}}>
              <span style={{color:'#FFB800'}}>★</span>{perfume.rating}
              <span style={{color:S.textLight}}>({perfume.reviews.toLocaleString()})</span>
            </span>
          </div>
          <div style={{fontSize:14,color:S.text,lineHeight:1.65,marginTop:14}}>{perfume.desc}</div>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',padding:'14px 16px 0',gap:20,borderBottom:`1px solid ${S.border}`}}>
          {[
            {id:'note',label:'향 구성'},
            {id:'review',label:`리뷰 ${perfume.reviews}`},
            {id:'info',label:'정보'},
          ].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{background:'none',border:'none',padding:'10px 0',cursor:'pointer',fontFamily:'inherit',
                borderBottom: tab===t.id ? `2px solid ${S.primaryDark}` : '2px solid transparent',
                color: tab===t.id ? S.primaryDark : S.textSec,
                fontSize:14,fontWeight:tab===t.id?800:600, marginBottom:-1}}>
              {t.label}
            </button>
          ))}
        </div>

        {tab==='note' && <NotesPyramid notes={perfume.notes}/>}
        {tab==='review' && <ReviewList/>}
        {tab==='info' && <InfoTab perfume={perfume}/>}
      </div>

      {/* Sticky CTA */}
      <div style={{padding:'10px 16px 12px',background:S.white,borderTop:`1px solid ${S.border}`,
        display:'flex',gap:8,flexShrink:0}}>
        <button onClick={()=>toggleLike(perfume.id)}
          style={{width:48,height:48,borderRadius:14,border:`1.5px solid ${S.border}`,
            background:S.white,color: liked ? S.accent : S.textSec,cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Icon name="heart" size={20} solid={liked}/>
        </button>
        <button style={{flex:1,height:48,borderRadius:14,border:'none',background:S.primaryDark,
          color:'#fff',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'inherit',boxShadow:S.shadowMd}}>
          한줄평 쓰기
        </button>
      </div>
    </React.Fragment>
  );
}

function NotesPyramid({notes}) {
  const rows = [
    {k:'탑 노트',label:'TOP',items:notes.top},
    {k:'미들 노트',label:'MIDDLE',items:notes.mid},
    {k:'베이스 노트',label:'BASE',items:notes.base},
  ];
  return (
    <div style={{padding:'16px'}}>
      {rows.map((r,i)=>(
        <div key={r.k} style={{background:S.white,borderRadius:14,padding:14,marginBottom:10,boxShadow:S.shadowSm}}>
          <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:10}}>
            <span style={{fontSize:10,fontWeight:900,color:S.primaryInk,letterSpacing:.8,
              background:S.secondary,padding:'4px 10px',borderRadius:9999}}>{r.label}</span>
            <span style={{fontSize:13,fontWeight:700,color:S.text}}>{r.k}</span>
          </div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {r.items.map(n=>(
              <span key={n} style={{background:S.gray100,color:S.text,fontSize:12,
                fontWeight:600,padding:'6px 12px',borderRadius:9999}}>{n}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ReviewList() {
  return (
    <div style={{padding:'16px'}}>
      {MATDA_DATA.REVIEWS.map(r=>(
        <div key={r.id} style={{background:S.white,borderRadius:12,padding:14,marginBottom:10,boxShadow:S.shadowSm}}>
          <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:8}}>
            <div style={{width:30,height:30,borderRadius:9999,background:S.secondary,
              color:S.primaryInk,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800}}>
              {r.user.slice(0,1)}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:S.text}}>{r.user}</div>
              <div style={{fontSize:11,color:S.textLight}}>{r.date} · {r.usage}</div>
            </div>
            <div style={{display:'flex',gap:1}}>
              {[1,2,3,4,5].map(n=>(
                <span key={n} style={{color:n<=r.rating?'#FFB800':S.gray300,fontSize:12}}>★</span>
              ))}
            </div>
          </div>
          <div style={{fontSize:13,color:S.text,lineHeight:1.6}}>{r.text}</div>
          <div style={{fontSize:11,color:S.textSec,marginTop:8,fontWeight:600}}>
            👍 도움이 됐어요 {r.helpful}
          </div>
        </div>
      ))}
    </div>
  );
}

function InfoTab({perfume}) {
  return (
    <div style={{padding:'16px'}}>
      <div style={{background:S.white,borderRadius:14,padding:16,boxShadow:S.shadowSm}}>
        <InfoRow label="농도" value="EDP"/>
        <InfoRow label="용량" value="50ml · 100ml"/>
        <InfoRow label="추천 상황" value={perfume.usage.join(' · ')}/>
        <InfoRow label="추천 계절" value={perfume.season.join(' · ')}/>
        <InfoRow label="성별" value="공용" last/>
      </div>
    </div>
  );
}
function InfoRow({label,value,last}){
  return (
    <div style={{display:'flex',padding:'10px 0',borderBottom: last?'none':`1px solid ${S.border}`}}>
      <span style={{fontSize:13,color:S.textSec,width:80,fontWeight:600}}>{label}</span>
      <span style={{fontSize:13,color:S.text,flex:1,fontWeight:500}}>{value}</span>
    </div>
  );
}

Object.assign(window, {ScreenPerfumeDetail, NotesPyramid, ReviewList, InfoTab, InfoRow});
