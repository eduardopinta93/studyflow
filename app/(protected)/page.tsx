import Link from 'next/link';
import { courses } from '@/app/data/courses';

export default function DashboardPage() {
    return (
        <section className="courses-page">
            <div className="courses-heading">
                <div>
                    <p className="page-eyebrow">Dashboard</p>
                    <h1>My Courses</h1>
                    <p>Your current courses, together in one place.</p>
                </div>
                <Link className="primary-button" href="/courses">
                    View all courses
                </Link>
            </div>

            <div className="course-grid">
                {courses.map((course) => (
                    <article className="course-card" key={course.code}>
                        <div className="course-card-heading">
                            <div>
                                <p className="course-code">{course.code}</p>
                                <h2>{course.name}</h2>
                            </div>
                            <span className="course-status">Active</span>
                        </div>
                        <p className="course-instructor">{course.instructor}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}