import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h1>Home</h1>

      <Link to="/login">Login</Link>
      <br />
      <Link to="/register">Create Account</Link>
    </div>
  );
}

export default Home;



