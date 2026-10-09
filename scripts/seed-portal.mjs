import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CLASSMATES = ['Emma Rodriguez', 'Daniel Okafor', 'Priya Sharma'];

const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

function announcementTemplates(course) {
  const name = course.name;
  return [
    {
      title: `Welcome to ${course.code || name}`,
      message: `Welcome to ${name}!\n\nThis is where I'll post everything that matters: schedule changes, study guides, exam logistics, and reminders. Check this page at the start of every week.\n\nOur meeting pattern is on the course home page, and all graded work lives under Assignments. Reply in Discussions any time — I read every thread.\n\nLet's have a great term.\n\n— Instructor`,
      createdAt: daysAgo(9),
    },
    {
      title: 'Week 4 update: office hours and study groups',
      message: `A quick update for the week:\n\n• Office hours move to Thursday 3:00–5:00 PM for the next two weeks.\n• The study-group sign-up sheet is pinned in Discussions.\n• Next assignment goes live Wednesday and closes the following Tuesday at 11:59 PM.\n\nIf you're falling behind, come to office hours early rather than the night before a deadline.`,
      createdAt: daysAgo(3),
    },
  ];
}

function discussionTemplates(course) {
  const subject = course.code || course.name;
  return [
    {
      title: `Introduce yourself to the ${subject} class`,
      pinned: true,
      locked: false,
      message:
        'Welcome! Please reply with a short introduction: your name, what you\'re studying, and one goal you have for this term. Getting to know each other makes the discussion boards much more useful.',
      createdAt: daysAgo(8),
      entries: [
        {
          authorName: CLASSMATES[0],
          message:
            "Hi everyone — Emma here. I'm in my second year, majoring in computing, and my goal this term is to keep assignments done before the weekend. Looking forward to studying with you all!",
          createdAt: daysAgo(7),
          replies: [
            {
              authorName: CLASSMATES[1],
              message:
                'Nice to meet you Emma! I\'m Daniel — career changer here, so I\'m taking this term slowly and focusing on the fundamentals.',
              createdAt: daysAgo(6),
            },
          ],
        },
        {
          authorName: CLASSMATES[2],
          message:
            "Hey all, Priya from the health-sciences track. My goal is to hit every deadline the day it opens — accountability partners welcome!",
          createdAt: daysAgo(5),
          replies: [],
        },
      ],
    },
    {
      title: `What's tripping you up in ${subject} so far?`,
      pinned: false,
      locked: false,
      message:
        'Drop the concept you found trickiest this week, and how you worked through it (or where you\'re still stuck). I\'ll answer the most common ones in Friday\'s recap.',
      createdAt: daysAgo(4),
      entries: [
        {
          authorName: CLASSMATES[1],
          message:
            'For me it was keeping the steps straight under time pressure. Flashcards for the process, then practice problems without notes — that finally made it click.',
          createdAt: daysAgo(3),
          replies: [
            {
              authorName: CLASSMATES[0],
              message:
                'Same here. Doing the practice set twice — once messy, once clean — helped more than re-reading the notes.',
              createdAt: daysAgo(2),
            },
          ],
        },
        {
          authorName: CLASSMATES[2],
          message:
            'I got stuck on question 4 of the last set for ages. Turning it into an example from everyday life is what finally made it make sense.',
          createdAt: daysAgo(1),
          replies: [],
        },
      ],
    },
  ];
}

async function main() {
  const users = await prisma.user.findMany({ select: { id: true } });
  let announcementsCreated = 0;
  let topicsCreated = 0;
  let entriesCreated = 0;

  for (const user of users) {
    const courses = await prisma.course.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
    });

    for (const course of courses) {
      for (const template of announcementTemplates(course)) {
        const existing = await prisma.announcement.findFirst({
          where: { courseId: course.id, title: template.title },
          select: { id: true },
        });
        if (!existing) {
          await prisma.announcement.create({
            data: {
              title: template.title,
              message: template.message,
              authorName: 'Instructor',
              courseId: course.id,
              createdAt: template.createdAt,
            },
          });
          announcementsCreated++;
        }
      }

      for (const template of discussionTemplates(course)) {
        const existing = await prisma.discussionTopic.findFirst({
          where: { courseId: course.id, title: template.title },
          select: { id: true },
        });
        if (existing) continue;

        const topic = await prisma.discussionTopic.create({
          data: {
            title: template.title,
            message: template.message,
            authorName: 'Instructor',
            pinned: template.pinned,
            locked: template.locked,
            courseId: course.id,
            createdAt: template.createdAt,
          },
        });
        topicsCreated++;

        for (const entry of template.entries) {
          const created = await prisma.discussionEntry.create({
            data: {
              message: entry.message,
              authorName: entry.authorName,
              topicId: topic.id,
              createdAt: entry.createdAt,
            },
          });
          entriesCreated++;

          for (const reply of entry.replies) {
            await prisma.discussionEntry.create({
              data: {
                message: reply.message,
                authorName: reply.authorName,
                topicId: topic.id,
                parentId: created.id,
                createdAt: reply.createdAt,
              },
            });
            entriesCreated++;
          }
        }
      }
    }
  }

  console.log(
    `Portal seed: ${announcementsCreated} announcements, ${topicsCreated} discussion topics, ${entriesCreated} replies`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
