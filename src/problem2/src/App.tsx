import { SwapForm } from './components/SwapForm';

export default function App() {
  return (
    <div className="app">
      <div className="app__bg" aria-hidden="true">
        <div className="orb orb--a" />
        <div className="orb orb--b" />
        <div className="orb orb--c" />
      </div>
      <main className="app__main">
        <SwapForm />
      </main>
    </div>
  );
}
