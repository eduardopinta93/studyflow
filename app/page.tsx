import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <section className="home-section">
      <div className="pageWrapper">
        <div className="hero-text">
          <p className="hero-eyebrow">Your semester, in focus</p>
          <h1>Make room for the work that matters.</h1>
          <p className="hero-description">
            StudyFlow brings your courses, assignments, and deadlines together
            so you always know what is next.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" href="/assignments">
              View assignments
            </Link>
            <Link className="secondary-button" href="/courses">
              Manage courses
            </Link>
          </div>
        </div>

        <div className="hero-image">
          <Image
            alt="StudyFlow planner showing a calendar and upcoming tasks"
            height={620}
            priority
            src="/studyflow-hero.svg"
            width={760}
          />

          <div className="overview-card">
            <div className="overview-header">
              <div>
                <p className="overview-label">This week</p>
                <h2>Academic overview</h2>
              </div>
              <span className="status-badge">On track</span>
            </div>

            <div className="overview-stats">
              <div className="stat-item">
                <p className="stat-number">4</p>
                <p className="stat-label">Courses</p>
              </div>
              <div className="stat-item">
                <p className="stat-number">12</p>
                <p className="stat-label">Assignments</p>
              </div>
              <div className="stat-item">
                <p className="stat-number">7</p>
                <p className="stat-label">Completed</p>
              </div>
            </div>

            <div className="upcoming-section">
              <h3>Upcoming</h3>
              <ul className="upcoming-list">
                <li>
                  <span>Web development wireframe</span>
                  <time>Sep 18</time>
                </li>
                <li>
                  <span>Database project</span>
                  <time>Sep 20</time>
                </li>
                <li>
                  <span>Research paper</span>
                  <time>Sep 24</time>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="feature-row">
        <p className="feature-item">Plan your workload in one place.</p>
        <p className="feature-item">See deadlines before they become urgent.</p>
        <p className="feature-item">Track progress across every course.</p>
      </div>
    </section>
  );
}
