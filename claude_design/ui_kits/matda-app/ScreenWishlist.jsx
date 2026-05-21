// Wishlist (위시리스트)
function ScreenWishlist({liked, toggleLike, onOpenPerfume}) {
  const likedPerfumes = MATDA_DATA.PERFUMES.filter(p => liked[p.id]);
  const [sort, setSort] = React.useState('recent');

  return (
    <React.Fragment>
      <TopBar title="위시리스트"/>
      <div style={{padding:'0 16px 12px',display:'flex',gap:6,alignItems:'center'}}>
        <SortPill active={sort==='recent'} onClick={()=>setSort('recent')}>최신순</SortPill>
        <SortPill active={sort==='price'} onClick={()=>setSort('price')}>가격순</SortPill>
        <SortPill active={sort==='rating'} onClick={()=>setSort('rating')}>평점순</SortPill>
        <span style={{marginLeft:'auto',fontSize:12,color:S.textSec,fontWeight:600}}>
          {likedPerfumes.length}개
        </span>
      </div>

      {likedPerfumes.length === 0 ? (
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',
          justifyContent:'center',padding:'60px 32px',gap:14,textAlign:'center'}}>
          <div style={{width:80,height:80,borderRadius:9999,background:S.secondary,
            display:'flex',alignItems:'center',justifyContent:'center',color:S.primaryLight}}>
            <Icon name="heart" size={38}/>
          </div>
          <div style={{fontSize:16,fontWeight:700,color:S.text}}>아직 좋아한 향이 없어요</div>
          <div style={{fontSize:13,color:S.textSec,lineHeight:1.5}}>찾아보기에서 마음에 드는 향수를<br/>하트로 저장해 보세요.</div>
        </div>
      ) : (
        <div style={{flex:1,overflowY:'auto',padding:'4px 16px 20px'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            {likedPerfumes.map(p => (
              <PerfumeCard key={p.id} perfume={p} size="sm"
                liked={true} onLike={()=>toggleLike(p.id)}
                onClick={()=>onOpenPerfume(p)}/>
            ))}
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

function SortPill({active, onClick, children}) {
  return (
    <button onClick={onClick}
      style={{background: active ? S.primaryDark : S.white,
        color: active ? '#fff' : S.text,
        border:`1px solid ${active?S.primaryDark:S.border}`,
        padding:'6px 12px',borderRadius:9999,fontSize:12,fontWeight:active?700:600,
        cursor:'pointer',fontFamily:'inherit',boxShadow:active?'none':S.shadowSm}}>
      {children}
    </button>
  );
}

Object.assign(window, {ScreenWishlist, SortPill});
