// eslint-disable-next-line react/prop-types
const Menu = ({ setPage, joinCode, setJoinCode }) => {
  return (
    <div className="home">
      <div className="create box">
        <button onClick={() => setPage('create')}>
          Creer une Salle de videoconference
        </button>
      </div>

      <div className="answer box">
        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          placeholder="Join with code"
        />
        <button onClick={() => setPage('join')}>Rejoindre un Appel</button>
      </div>
    </div>
  );
};

export default Menu;
