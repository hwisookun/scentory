// Explore (찾아보기) — home tab
function ScreenExplore({onOpenPerfume, liked, toggleLike}) {
  const [banner, setBanner] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setBanner(b => (b+1) % MATDA_DATA.BANNERS.length), 3500);
    return () => clearInterval(t);
  }, []);

  const [searchFocused, setSearchFocused] = React.useState(false);
  const [query, setQuery] = React.useState('');

  return (
    <React.Fragment>
      <TopBar logo right={[
        <button key="n" style={{background:'none',border:'none',padding:6,cursor:'pointer',color:S.text,display:'flex'}}>
          <Icon name="notif" size={22}/>
        </button>
      ]}/>
      <div style={{flex:1,overflowY:'auto',paddingBottom:16}}>
        {/* Search bar */}
        <div style={{padding:'0 16px 16px'}}>
          <div style={{background:S.white,borderRadius:14,padding:'12px 16px',display:'flex',
            gap:10,alignItems:'center',boxShadow:S.shadowSm,border:searchFocused?`1.5px solid ${S.primaryDark}`:'1.5px solid transparent'}}>
            <span style={{color:S.textLight,display:'flex'}}><Icon name="search" size={18}/></span>
            <input value={query} onChange={e=>setQuery(e.target.value)}
              onFocus={()=>setSearchFocused(true)} onBlur={()=>setSearchFocused(false)}
              placeholder="향수명, 브랜드, 원료 검색"
              style={{border:'none',outline:'none',flex:1,fontSize:14,background:'transparent',
                fontFamily:'inherit',color:S.text}}/>
          </div>
        </div>

        {/* Banner */}
        <div style={{padding:'0 16px 20px'}}>
          <EventBanner banner={MATDA_DATA.BANNERS[banner]}/>
          <div style={{display:'flex',gap:5,justifyContent:'center',marginTop:10}}>
            {MATDA_DATA.BANNERS.map((_,i)=>(
              <span key={i} style={{height:5,borderRadius:9999,
                width:i===banner?18:5,
                background:i===banner?S.primaryDark:S.gray300,transition:'all .3s'}}/>
            ))}
          </div>
        </div>

        {/* Today's picks */}
        <SectionHeader title="오늘의 향수" sub="당신을 위해 준비한 추천"/>
        <div style={{display:'flex',gap:12,padding:'0 16px 24px',overflowX:'auto',scrollbarWidth:'none'}}>
          {MATDA_DATA.PERFUMES.slice(0,4).map(p=>(
            <PerfumeCard key={p.id} perfume={p}
              liked={liked[p.id]} onLike={()=>toggleLike(p.id)}
              onClick={()=>onOpenPerfume(p)}/>
          ))}
        </div>

        {/* Editor's picks grid */}
        <SectionHeader title="에디터 추천 ✨" sub="이런 향수는 어떠세요?"/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,padding:'0 16px'}}>
          {MATDA_DATA.PERFUMES.slice(2,6).map(p=>(
            <PerfumeCard key={p.id} perfume={p} size="sm"
              liked={liked[p.id]} onLike={()=>toggleLike(p.id)}
              onClick={()=>onOpenPerfume(p)}/>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
}

function SectionHeader({title, sub}) {
  return (
    <div style={{padding:'8px 16px 12px',display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
      <div>
        <div style={{fontSize:18,fontWeight:800,color:S.text,letterSpacing:-.2}}>{title}</div>
        {sub && <div style={{fontSize:12,color:S.textSec,marginTop:2}}>{sub}</div>}
      </div>
      <button style={{background:'none',border:'none',padding:0,cursor:'pointer',color:S.textSec,
        fontSize:12,fontWeight:600,display:'inline-flex',alignItems:'center',gap:2,fontFamily:'inherit'}}>
        더보기 <Icon name="chevR" size={12}/>
      </button>
    </div>
  );
}

Object.assign(window, {ScreenExplore, SectionHeader});
