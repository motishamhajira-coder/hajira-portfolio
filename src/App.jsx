import { useEffect, useLayoutEffect, useState } from "react";
import emailjs from "@emailjs/browser";
import {
  featuredProjects,
  otherProjects,
  upcomingProjects,
} from "./data/projects.js";
import { ProjectList, UpcomingList } from "./components/ProjectList.jsx";
import SkillSphere from "./components/SkillSphere.jsx";
import SkillCategoryOverlay from "./components/SkillCategoryOverlay.jsx";
import { skills } from "./data/skills.js";
import {
  ArrowUpRight,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";

function SocialIcon({ name }) {
  if (name === "github") return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.51-1.29-1.24-1.63-1.24-1.63-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 .1.77 2.04 3.36 1.45.1-.72.39-1.21.7-1.49-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.12-1.44 3.05-1.14 3.05-1.14.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.29-2.61 5.24-5.1 5.51.4.35.75 1.03.75 2.08v3.08c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z"/></svg>;
  if (name === "linkedin") return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.34H4.98V9h2.95v9.34ZM6.45 7.72a1.71 1.71 0 1 1 .02-3.42 1.71 1.71 0 0 1-.02 3.42Zm11.89 10.62h-2.95v-4.54c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.62H9.21V9h2.83v1.28h.04c.39-.74 1.36-1.52 2.8-1.52 3 0 3.56 1.97 3.56 4.53v5.05Z"/></svg>;
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M22.36 3h-1.92L12 9.08 3.56 3H1.64C.74 3 0 3.73 0 4.64v14.72C0 20.27.74 21 1.64 21h2.4V8.64L12 14.4l7.96-5.76V21h2.4c.9 0 1.64-.73 1.64-1.64V4.64C24 3.73 23.26 3 22.36 3Z"/></svg>;
}

function Orb() {
  return (
    <div className="orb-wrap" aria-label="Interactive abstract 3D form">
      <div className="orb">
        <i />
        <b />
        <em />
      </div>
      <span className="orb-caption">SYSTEMS IN MOTION · 01</span>
    </div>
  );
}

const introParticles = [
  [120, 28], [184, 52], [212, 120], [184, 188],
  [120, 212], [56, 188], [28, 120], [56, 52],
];
const introEdges = introParticles.map((_, index) => [index, (index + 1) % introParticles.length]);

function IntroAnimation({ onComplete }) {
  return (
    <div
      className="portfolio-intro"
      aria-hidden="true"
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) onComplete();
      }}
    >
      <div className="portfolio-intro-mark">
        <svg className="portfolio-intro-network" viewBox="0 0 240 240">
          <g className="portfolio-intro-edges">
            {introEdges.map(([start, end], index) => (
              <line
                key={`edge-${index}`}
                x1={introParticles[start][0]}
                y1={introParticles[start][1]}
                x2={introParticles[end][0]}
                y2={introParticles[end][1]}
                pathLength="1"
              />
            ))}
          </g>
          <g className="portfolio-intro-particles">
            {introParticles.map(([cx, cy], index) => (
              <circle key={`particle-${index}`} cx={cx} cy={cy} r="2.5" style={{ animationDelay: `${0.52 + index * 0.065}s` }} />
            ))}
          </g>
        </svg>
        <span>HSM</span>
      </div>
    </div>
  );
}

export default function App() {
  const [showIntro, setShowIntro] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useLayoutEffect(() => {
    if (!showIntro) return undefined;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    const previousPaddingRight = root.style.paddingRight;
    const scrollbarWidth = window.innerWidth - root.clientWidth;
    root.style.overflow = "hidden";
    if (scrollbarWidth > 0) root.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      root.style.overflow = previousOverflow;
      root.style.paddingRight = previousPaddingRight;
    };
  }, [showIntro]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    document
      .querySelectorAll(".section,.contact")
      .forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
    };
  }, []);
  const [contactStatus, setContactStatus] = useState({ type: "idle", message: "" });
  const [theme, setTheme] = useState("dark"),
    [open, setOpen] = useState(false);
  const handleContactSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (!serviceId || !templateId || !publicKey) {
      setContactStatus({ type: "error", message: "Email service is not configured. Set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY." });
      return;
    }
    setContactStatus({ type: "loading", message: "Sending your message…" });
    try {
      await emailjs.sendForm(serviceId, templateId, form, { publicKey });
      form.reset();
      setContactStatus({ type: "success", message: "Your message was sent successfully." });
    } catch (error) {
      setContactStatus({ type: "error", message: "Your message could not be sent. Please try again later." });
    }
  };  document.documentElement.dataset.theme = theme;
  const links = [
    "About",
    "Skills",
    "Projects",
    "Experience",
    "Education",
    "Contact",
  ];
  return (
    <>
      {showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} />}
      <header className="nav">
        <a className="brand" href="#home">
          HSM
        </a>
        <nav className={open ? "nav-links open" : "nav-links"}>
          {links.map((x) => (
            <a
              key={x}
              href={"#" + x.toLowerCase()}
              onClick={() => setOpen(false)}
            >
              {x}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <button
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </button>
          <button
            className="menu-btn"
            aria-label="Toggle menu"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main>
        <section id="home" className="hero container">
          <div className="hero-copy">
            <p className="hero-availability"><span aria-hidden="true" />OPEN TO INTERNSHIPS</p>
            <h1 className="hero-name">Hajira Sineen Mothisham</h1>
            <p className="eyebrow">AI/ML Engineer · Software Developer</p>
            <div className="hero-links">
              <a href="https://github.com/motishamhajira-coder" target="_blank" rel="noreferrer"><SocialIcon name="github" />GitHub <ArrowUpRight size={14} /></a>
              <a href="https://www.linkedin.com/in/hajira-sineen-mothisham-7a8072387" target="_blank" rel="noreferrer"><SocialIcon name="linkedin" />LinkedIn <ArrowUpRight size={14} /></a>
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=motishamhajiras%40gmail.com" target="_blank" rel="noreferrer" aria-label="Compose Gmail to motishamhajiras@gmail.com"><SocialIcon name="gmail" />Gmail <ArrowUpRight size={14} /></a>
              <a href="/Hajira_Sineen_Mothisham_Resume.pdf" target="_blank" rel="noreferrer">Resume <ArrowUpRight size={14} /></a>
            </div>
          </div>
          <SkillSphere skills={skills} />          <div className="hero-meta">
            <span>BASED IN BHATKAL, INDIA</span>
            <span>SCROLL TO EXPLORE ↓</span>
          </div>
        </section>
        <section id="about" className="section container about-section">
          <div className="about-heading">
            <p className="eyebrow section-tagline">01 / ABOUT</p>
            <h2 className="section-title about-title">How I think<br /><span>and build</span></h2>
          </div>
          <div className="about-copy">
            <p>I'm an AI/ML engineering student, currently exploring the intersection of artificial intelligence and software engineering.</p>
            <p>My interests lie in machine learning, generative AI, computer vision and building software applications that bring these technologies into practical use.</p>
            <p>I enjoy experimenting with ideas, understanding how systems work beneath the surface, and turning what I learn into projects. I'm driven by curiosity, continuous learning and the challenge of building technology that makes a meaningful difference.</p>
          </div>
        </section>        <section id="skills" className="section container">
          <p className="eyebrow section-tagline">02 / TECHNICAL SKILLS</p>
          <h2 className="section-title skills-title"><span>Tools I work</span><br /><span>and learn with</span></h2>
          <SkillCategoryOverlay skills={skills} />
        </section>        <section id="projects" className="section container">
          <p className="eyebrow section-tagline">03 / SELECTED WORK</p>
          <h2 className="section-title">
            Projects in
            <br />
            <span>progress and practice</span>
          </h2>
          <h3 className="subhead">Featured projects</h3>
          <ProjectList projects={featuredProjects} />
          <h3 className="subhead">Other projects</h3>
          <ProjectList projects={otherProjects} showNumbers={false} />
          <h3 className="subhead">On the horizon</h3>
          <UpcomingList projects={upcomingProjects} />
        </section>
        <section id="experience" className="section container">
          <p className="eyebrow section-tagline">04 / EXPERIENCE & LEARNING</p>
          <h2 className="section-title">
            Learning by
            <br />
            <span>building</span>
          </h2>
          <div className="experience">
            <article>
              <span>OCT — NOV 2026 · PROJECT-BASED TRAINING</span>
              <h3>Datheon — Python & Generative AI</h3>
              <p>
                Structured prompting, JSON extraction and validation, with
                exposure to LangChain, RAG and vector embeddings.
              </p>
            </article>
            <article>
              <span>AI & MACHINE LEARNING PROGRAMME</span>
              <h3>One Stop × IIT Kharagpur</h3>
              <p>
                Hands-on learning through six practical projects, covering
                datasets, preprocessing, model training, testing and evaluation.
              </p>
             
              <p className="muted">
                Models and algorithms explored: see training materials for
                specific methods.
              </p>
            </article>
          </div>
        </section>
        <section id="education" className="section container">
          <p className="eyebrow section-tagline">05 / EDUCATION</p>
          <h2 className="section-title">
            Building a strong
            <br />
            <span>technical foundation</span>
          </h2>
          <div className="education-list">
            <article className="education-entry">
              <h3>Bachelor of Engineering, Artificial Intelligence &amp; Machine Learning</h3>
              <p>Anjuman Institute of Technology and Management, Bhatkal</p>
              <p className="education-detail">2025–2029</p>
              <p className="education-detail">Current CGPA: 9.0</p>
            </article>
            <article className="education-entry">
              <h3>Pre-University Education</h3>
              <p>Anjuman PU College for Women, Bhatkal</p>
              <p className="education-detail">2023–2025</p>
              <p className="education-detail">93%</p>
            </article>
          </div>
        </section>
        <section id="contact" className="contact container">
          <p className="eyebrow section-tagline">06 / CONTACT</p>
          <h2 className="section-title contact-title">Have a good<br /><span>problem to solve?</span></h2>
          <form className="contact-form" onSubmit={handleContactSubmit}>
            <label>Name<input name="name" autoComplete="name" placeholder="Your full name" required /></label>
            <label>Email<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label>
            <label>Message<textarea name="message" rows="5" placeholder="Tell me about your project or opportunity..." required /></label>
            <button className="contact-submit" type="submit" disabled={contactStatus.type === "loading"}>{contactStatus.type === "loading" ? "Sending…" : "Send Message"} <ArrowUpRight size={16} /></button>
            {contactStatus.message && <p className={`contact-form-note ${contactStatus.type}`} role="status" aria-live="polite">{contactStatus.message}</p>}
          </form>
        </section>      </main>
      <footer className="container footer">
        <span>HAJIRA SINEEN MOTHISHAM © 2026</span>
        <a href="#home">BACK TO TOP ↑</a>
      </footer>
    </>
  );
}






















