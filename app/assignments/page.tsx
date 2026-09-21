import Link from 'next/link';

const assignments = [
    {
        title: 'Web development wireframe',
        course: 'WDD 430',
        dueDate: 'Sep 18, 2026',
        priority: 'High',
        status: 'In progress',
    },
    {
        title: 'Database project',
        course: 'CS 360',
        dueDate: 'Sep 20, 2026',
        priority: 'Medium',
        status: 'Not started',
    },
    {
        title: 'Research paper',
        course: 'ENG 210',
        dueDate: 'Sep 24, 2026',
        priority: 'High',
        status: 'Not started',
    },
    {
        title: 'API documentation review',
        course: 'WDD 430',
        dueDate: 'Sep 28, 2026',
        priority: 'Low',
        status: 'Completed',
    },
];

export default function AssignmentsPage() {
    return (
        <section className="assignments-page">
            <div className="assignments-heading">
                <div>
                    <p className="page-eyebrow">Stay on top of your work</p>
                    <h1>Assignments</h1>
                    <p>Track upcoming deadlines and your progress across every course.</p>
                </div>
                <Link className="primary-button" href="#add-assignment">
                    Add assignment
                </Link>
            </div>

            <div className="assignment-tools">
                <label htmlFor="assignment-search">Search assignments</label>
                <input id="assignment-search" name="assignment-search" placeholder="Search by title or course" type="search" />
                <label htmlFor="assignment-filter">Filter assignments</label>
                <select defaultValue="all" id="assignment-filter" name="assignment-filter">
                    <option value="all">All statuses</option>
                    <option value="not-started">Not started</option>
                    <option value="in-progress">In progress</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            <div className="assignment-summary">
                <div>
                    <span className="summary-number">4</span>
                    <span>Total tasks</span>
                </div>
                <div>
                    <span className="summary-number">3</span>
                    <span>Upcoming</span>
                </div>
                <div>
                    <span className="summary-number">1</span>
                    <span>Completed</span>
                </div>
            </div>

            <div className="assignment-list">
                {assignments.map((assignment) => (
                    <article className="assignment-item" key={assignment.title}>
                        <div className="assignment-check" aria-hidden="true">
                            {assignment.status === 'Completed' ? '✓' : ''}
                        </div>
                        <div className="assignment-details">
                            <p className="assignment-course">{assignment.course}</p>
                            <h2>{assignment.title}</h2>
                            <p className="assignment-due">Due {assignment.dueDate}</p>
                        </div>
                        <span className={`priority-${assignment.priority.toLowerCase()}`}>
                            {assignment.priority} priority
                        </span>
                        <span className={`assignment-status status-${assignment.status.toLowerCase().replace(' ', '-')}`}>
                            {assignment.status}
                        </span>
                        <div className="assignment-actions">
                            <button type="button">Edit</button>
                            <button type="button">Delete</button>
                        </div>
                    </article>
                ))}
            </div>

            <div className="add-assignment-placeholder" id="add-assignment">
                <h2>Ready to plan another task?</h2>
                <p>The assignment form will go here when assignment data is connected to the database.</p>
            </div>
        </section>
    );
}
