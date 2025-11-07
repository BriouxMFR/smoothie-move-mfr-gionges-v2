import React from 'react'
export default function Leaderboard({users}){
  const sorted = [...users].sort((a,b)=> (b.points||0)-(a.points||0)).slice(0,10)
  return (
    <div>
      {sorted.map((u,i)=>(
        <div key={u.id} style={{display:'flex',justifyContent:'space-between',padding:'6px 0'}}>
          <div>{i+1}. {u.name}</div>
          <div style={{fontWeight:700}}>{Math.round(u.points||0)}</div>
        </div>
      ))}
    </div>
  )
}
