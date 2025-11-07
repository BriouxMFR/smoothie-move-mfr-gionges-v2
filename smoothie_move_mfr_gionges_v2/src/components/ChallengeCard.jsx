import React, {useEffect, useState} from 'react'
const WEEKLY = [
  {id:1, title:'Faire 3000 pas', bonus:5},
  {id:2, title:'Sortie à vélo 5 km', bonus:8},
  {id:3, title:"Photo d'une activité extérieure", bonus:6},
]
export default function ChallengeCard(){
  const [idx, setIdx] = useState(0)
  useEffect(()=> {
    const i = Math.floor((Date.now()/1000/60/60/24/7) % WEEKLY.length)
    setIdx(i)
  },[])
  const c = WEEKLY[idx]
  return (
    <div>
      <div style={{fontWeight:700}}>{c.title}</div>
      <div style={{fontSize:13,color:'#666'}}>Bonus : +{c.bonus} pts</div>
    </div>
  )
}
