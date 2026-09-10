import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { newRoomId } from "@sharedmd/shared"
import { getRecent, getUser, setUserName } from "../lib/user"

export default function Landing() {
  const nav = useNavigate()
  const [user, setUser] = useState(getUser)
  const [editing, setEditing] = useState(false)
  const recent = getRecent()

  const rename = (name: string) => {
    setUser(setUserName(name))
    setEditing(false)
  }

  return (
    <main className="landing">
      <h1>SharedMD</h1>
      <p className="lead">
        A markdown document you can write with other people at the same time. No accounts. Send the link, start typing.
      </p>

      <div className="row">
        <button className="primary" onClick={() => nav(`/d/${newRoomId()}`)}>New document</button>
        <span className="me">
          <span className="dot" style={{ background: user.color }} />
          {editing ? (
            <input
              autoFocus
              defaultValue={user.name}
              onBlur={(e) => rename(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && rename(e.currentTarget.value)}
            />
          ) : (
            <button onClick={() => setEditing(true)} title="Change your name">{user.name}</button>
          )}
        </span>
      </div>

      {recent.length > 0 && (
        <>
          <h2>Recent on this device</h2>
          <ul className="recent">
            {recent.map((r) => (
              <li key={r.id}>
                <Link to={`/d/${r.id}`}>
                  <span>{r.title}</span>
                  <time dateTime={new Date(r.at).toISOString()}>{new Date(r.at).toLocaleDateString()}</time>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  )
}
