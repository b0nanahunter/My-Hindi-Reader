import { useEffect, useState } from "react"; import jwt_decode from "jwt-decode";
const CLIENT_ID = "719213031513-fo5i0ai9qhu5aru7mnbffc5a3p9ccov7.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/drive.appdata";
function App() {
const [user, setUser] = useState(null);
const [logs, setLogs] = useState([]);
const [dictionary, setDictionary] = useState([]);
const [fileId, setFileId] = useState(null);
const log = (msg) => setLogs(prev => [...prev, msg]);
useEffect(() => {
window.google.accounts.id.initialize({ client_id: CLIENT_ID, callback: handleCredentialResponse });
window.google.accounts.id.renderButton(document.getElementById("googleSignInDiv"), { theme: "outline", size: "large" });
}, []);
const handleCredentialResponse = (response) => {
const userObject = jwt_decode(response.credential);
setUser(userObject);
log("✅ Авторизация прошла. Пользователь: " + userObject.email);
gapi.load("client:auth2", async () => {
try {
await gapi.client.init({ clientId: CLIENT_ID, scope: SCOPES });
log("🔄 Google API инициализирован");
} catch (err) {
log("❌ Ошибка при init(): " + JSON.stringify(err));
}});
};
const connectDrive = async () => {
try {
const authInstance = gapi.auth2.getAuthInstance();
await authInstance.signIn();
log("📁 Подключение к Google Drive успешно");
loadOrCreateFile();
} catch (err) {
log("❌ Ошибка входа в Drive: " + JSON.stringify(err));
}};
const loadOrCreateFile = async () => {
try {
log("🔍 Ищем файл dictionary.json...");
const res = await gapi.client.drive.files.list({
spaces: "appDataFolder", fields: "files(id, name)", q: "name='dictionary.json'"
});
if (res.result.files.length > 0) {
const file = res.result.files[0];
setFileId(file.id);
log("📄 Файл найден, ID: " + file.id);
const content = await gapi.client.drive.files.get({ fileId: file.id, alt: "media" });
setDictionary(JSON.parse(content.body));
log("✅ Файл загружен");
} else {
log("📄 Файл не найден, создаём новый...");
const file = await gapi.client.drive.files.create({
resource: { name: "dictionary.json", mimeType: "application/json", parents: ["appDataFolder"] },
media: { mimeType: "application/json", body: JSON.stringify([]) }, fields: "id"
});
setFileId(file.result.id);
setDictionary([]);
log("✅ Файл создан, ID: " + file.result.id);
}} catch (err) {
log("❌ Ошибка загрузки/создания файла: " + JSON.stringify(err));
}};
const saveDictionary = async (updatedDict) => {
try {
await gapi.client.request({
path: `/upload/drive/v3/files/${fileId}`, method: "PATCH",
params: { uploadType: "media" }, body: JSON.stringify(updatedDict)
});
setDictionary(updatedDict);
log("💾 Словарь сохранён");
} catch (err) {
log("❌ Ошибка сохранения словаря: " + JSON.stringify(err));
}};
const addExampleWord = () => {
const updated = [...dictionary, {
word: "समाज", translation: "общество", sentence: "भारतीय समाज बहुत विविध है।", source: "ईदगाह",
repetition: { day1: false, day2: false, day3: false, day4: false, day5: false, day6: false, day7: false, week2: false, week4: false }
}];
saveDictionary(updated);
};
return (
<div>
<h1>My Hindi Reader (Debug)</h1>
{!user && <div id="googleSignInDiv"></div>}
{user && (<><button onClick={connectDrive}>📁 Подключить Google Drive</button><button onClick={addExampleWord} disabled={!fileId}>➕ Добавить слово</button></>)}
<h3>Логи:</h3><pre>{logs.join("\n")}</pre>
</div>);
}
export default App;