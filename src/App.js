
import { useEffect, useState } from "react";
import jwt_decode from "jwt-decode";

const CLIENT_ID = "719213031513-fo5i0ai9qhu5aru7mnbffc5a3p9ccov7.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/drive.appdata";

function App() {
  const [user, setUser] = useState(null);
  const [dictionary, setDictionary] = useState([]);
  const [fileId, setFileId] = useState(null);
  const [driveReady, setDriveReady] = useState(false);

  useEffect(() => {
    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
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
    gapi.load("client:auth2", () => {
      gapi.client.init({
        clientId: CLIENT_ID,
        scope: SCOPES
      });
    });
  };

  const connectDrive = async () => {
    const authInstance = gapi.auth2.getAuthInstance();
    await authInstance.signIn();
    setDriveReady(true);
    loadOrCreateFile();
  };

  const loadOrCreateFile = async () => {
    const res = await gapi.client.drive.files.list({
      spaces: "appDataFolder",
      fields: "files(id, name)",
      q: "name='dictionary.json'"
    });

    if (res.result.files.length > 0) {
      const file = res.result.files[0];
      setFileId(file.id);
      const content = await gapi.client.drive.files.get({
        fileId: file.id,
        alt: "media"
      });
      setDictionary(JSON.parse(content.body));
    } else {
      const file = await gapi.client.drive.files.create({
        resource: {
          name: "dictionary.json",
          mimeType: "application/json",
          parents: ["appDataFolder"]
        },
        media: {
          mimeType: "application/json",
          body: JSON.stringify([])
        },
        fields: "id"
      });
      setFileId(file.result.id);
      setDictionary([]);
    }
  };

  const saveDictionary = async (updatedDict) => {
    await gapi.client.request({
      path: `/upload/drive/v3/files/${fileId}`,
      method: "PATCH",
      params: {
        uploadType: "media"
      },
      body: JSON.stringify(updatedDict)
    });
    setDictionary(updatedDict);
  };

  const addExampleWord = () => {
    const updated = [...dictionary, {
      word: "समाज",
      translation: "общество",
      sentence: "भारतीय समाज बहुत विविध है।",
      source: "ईदगाह",
      repetition: {
        day1: false,
        day2: false,
        day3: false,
        day4: false,
        day5: false,
        day6: false,
        day7: false,
        week2: false,
        week4: false
      }
    }];
    saveDictionary(updated);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>My Hindi Reader</h1>
      {!user && <div id="googleSignInDiv"></div>}
      {user && !driveReady && (
        <button onClick={connectDrive}>
          📁 Подключить Google Drive
        </button>
      )}
      {user && driveReady && (
        <div>
          <p>Добро пожаловать, {user.name}</p>
          <button onClick={addExampleWord}>➕ Добавить слово «समाज»</button>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#eee', padding: 10, marginTop: 20 }}>
            {JSON.stringify(dictionary, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;
