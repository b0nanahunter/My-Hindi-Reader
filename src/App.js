
import { useEffect, useState } from "react";
import jwt_decode from "jwt-decode";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    window.google.accounts.id.initialize({
      client_id: "719213031513-fo5i0ai9qhu5aru7mnbffc5a3p9ccov7.apps.googleusercontent.com",
      callback: handleCredentialResponse
    });

    window.google.accounts.id.renderButton(
      document.getElementById("googleSignInDiv"),
      { theme: "outline", size: "large" }
    );
  }, []);

  const handleCredentialResponse = (response) => {
    const userObject = jwt_decode(response.credential);
    setUser(userObject);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>My Hindi Reader</h1>
      {!user && <div id="googleSignInDiv"></div>}
      {user && (
        <div>
          <p>Привет, {user.name}!</p>
          <p>Email: {user.email}</p>
          <img src={user.picture} alt="user" style={{ borderRadius: "50%" }} />
        </div>
      )}
    </div>
  );
}

export default App;
