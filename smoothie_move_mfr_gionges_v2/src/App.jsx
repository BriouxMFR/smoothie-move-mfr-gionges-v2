import React, {useEffect, useState} from 'react'
import Leaderboard from './components/Leaderboard.jsx'
import ChallengeCard from './components/ChallengeCard.jsx'

const TEACHER = 'Mme Dupont'
const PRESET_STUDENTS = ['Léa','Thomas','Inès','Yanis','Clara','Hugo','Zoé','Maël','Lina','Noa']

function uid(){ return Math.random().toString(36).slice(2,9) }

export default function App(){
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [activities, setActivities] = useState([])

  useEffect(()=>{
    const u = JSON.parse(localStorage.getItem('sm_users')||'null')
    if(u) setUsers(u)
    else{
      const init = PRESET_STUDENTS.map((n,i)=>({id:uid(), name:n, points: Math.floor(Math.random()*60)}))
      localStorage.setItem('sm_users', JSON.stringify(init))
      setUsers(init)
    }
    const act = JSON.parse(localStorage.getItem('sm_activities')||'[]')
    setActivities(act)
  },[])

  useEffect(()=>{ localStorage.setItem('sm_users', JSON.stringify(users)) },[users])
  useEffect(()=>{ localStorage.setItem('sm_activities', JSON.stringify(activities)) },[activities])

  function loginAs(name){
    if(name === TEACHER){ setUser({id:'teacher', name:TEACHER, role:'admin'}); return }
    const found = users.find(u=>u.name === name)
    if(found){ setUser(found); return }
    const newU = {id: uid(), name, points:0}
    const nu = [...users, newU]; setUsers(nu); setUser(newU)
  }

  function submitActivity(type, value, photoData){
    if(!user) return alert('Connecte-toi d\'abord')
    const act = { id: uid(), userId: user.id, userName: user.name, type, value, photoData, status:'pending', points: Math.max(1, Math.round((type==='marche'? (value/5000)*1 : type==='sport'? (value/30)*3 : (value/10)*5)*10)/10) }
    setActivities([act, ...activities])
    alert('Activité soumise — en attente de validation.')
  }

  function validateActivity(actId, accept){
    const act = activities.find(a=>a.id===actId)
    if(!act) return
    if(accept){
      setUsers(users.map(u=> u.id===act.userId ? {...u, points: Math.round((u.points + act.points)*10)/10} : u))
      setActivities(activities.map(a=> a.id===actId ? {...a, status:'validated'} : a))
    } else {
      setActivities(activities.map(a=> a.id===actId ? {...a, status:'rejected'} : a))
    }
  }

  function logout(){ setUser(null) }

  return (
    <div className='container'>
      <header className='header'>
        <img src='/logo.png' className='logo' alt='logo' />
        <div>
          <h1>Smoothie Move</h1>
          <div className='subtitle'>MFR de Gionges — Bouge & gagne des smoothies 🍓</div>
        </div>
        <div style={{marginLeft:'auto'}}>
          {user ? (
            <div>
              <div style={{fontSize:12}}>Connecté : <strong>{user.name}</strong></div>
              <button className='small' onClick={logout}>Se déconnecter</button>
            </div>
          ) : (
            <div>
              <div style={{marginBottom:6}}>Se connecter :</div>
              <select onChange={(e)=> loginAs(e.target.value)}>
                <option>-- choisir un profil --</option>
                <option>{TEACHER}</option>
                {users.map(u=> <option key={u.id}>{u.name}</option>)}
                <option>Nouvel élève...</option>
              </select>
              <div style={{marginTop:8}}>
                <input id='newname' placeholder='Ton prénom' />
                <button className='small' onClick={()=>{ const v=document.getElementById('newname').value.trim(); if(v) loginAs(v) }}>Créer</button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className='main'>
        <section className='left'>
          <div className='card'>
            <h2>Mon tableau de bord</h2>
            {user ? (
              <>
                <div className='pointsBlock'><strong>{user.points ?? 0}</strong> pts</div>
                <div className='progressBar'><div style={{width: Math.min(100, ((user.points||0)/100)*100) +'%'}} className='progressFill'></div></div>
                <h3>Ajouter une activité</h3>
                <ActivityForm onSubmit={submitActivity} />
              </>
            ) : <p>Connecte-toi pour participer.</p>}
          </div>

          <div className='card'>
            <h3>Défis hebdomadaires</h3>
            <ChallengeCard />
          </div>

          <div className='card'>
            <h3>Activités récentes</h3>
            {activities.length===0 && <p>Aucune activité pour l'instant.</p>}
            {activities.map(a=>(
              <div key={a.id} style={{borderLeft:'3px solid #ffd1dc', padding:8, marginBottom:8, background:'#fff'}} >
                <div><strong>{a.userName}</strong> — {a.type} — {a.value} — <em>{a.status}</em></div>
                {a.photoData && <img src={a.photoData} style={{maxWidth:220, marginTop:6}} alt='photo' />}
              </div>
            ))}
          </div>
        </section>

        <aside className='right'>
          <div className='card'>
            <h3>Classement</h3>
            <Leaderboard users={users} />
          </div>

          <div className='card'>
            <h3>Espace enseignant</h3>
            <div>Responsable : <strong>{TEACHER}</strong></div>
            {user && user.role==='admin' ? (
              <>
                <div style={{marginTop:8}}><strong>Activités à valider</strong></div>
                {activities.filter(a=>a.status==='pending').map(a=>(
                  <div key={a.id} style={{border:'1px dashed #eee', padding:8, marginTop:8}}>
                    <div><strong>{a.userName}</strong> — {a.type} — {a.value} — {a.points} pts</div>
                    {a.photoData && <img src={a.photoData} style={{maxWidth:200, marginTop:6}} alt='photo' />}
                    <div style={{marginTop:6}}>
                      <button className='small' onClick={()=> validateActivity(a.id,true)}>Valider</button>
                      <button className='small' onClick={()=> validateActivity(a.id,false)} style={{marginLeft:6}}>Rejeter</button>
                    </div>
                  </div>
                ))}
              </>
            ) : <div>Connecte-toi en tant qu'enseignant pour valider.</div>}
          </div>
        </aside>
      </main>

      <footer className='footer'>Prototype — Smoothie Move • MFR de Gionges — Mme Dupont</footer>
    </div>
  )
}

function ActivityForm({onSubmit}){
  const [type,setType]=useState('marche')
  const [value,setValue]=useState(3000)
  const [photo,setPhoto]=useState(null)

  function handleFile(e){
    const f = e.target.files[0]
    if(!f) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result)
    reader.readAsDataURL(f)
  }

  return (
    <div>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <select value={type} onChange={e=>setType(e.target.value)}>
          <option value='marche'>Marche (pas)</option>
          <option value='sport'>Sport (min)</option>
          <option value='velo'>Vélo (km)</option>
        </select>
        <input type='number' value={value} onChange={e=>setValue(e.target.value)} style={{width:120}} />
      </div>
      <div style={{marginTop:8}}>
        <input type='file' accept='image/*' onChange={handleFile} />
      </div>
      <div style={{marginTop:8}}>
        <button className='small' onClick={()=> onSubmit(type, value, photo)}>Soumettre</button>
      </div>
    </div>
  )
}
