import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const instructorMessages = [
  {
    subject: 'Welcome to StudyFlow',
    body: "Hi there,\n\nWelcome to the course! I'll be sharing announcements, assignment feedback, and office-hour updates here. Make sure your profile is complete so I can reach you easily.\n\nLooking forward to a great term,\nYour Instructor",
  },
  {
    subject: 'Assignment 1 due this Friday',
    body: "Just a reminder that the first assignment is due this Friday at 11:59 PM.\n\nSubmit through the Assignments page — you can track your progress from the dashboard. Late submissions lose 10% per day, so don't leave it to the last minute.\n\nQuestions? Reply here or come to office hours.",
  },
  {
    subject: 'Office hours moved to Thursday',
    body: "This week's office hours are moved to Thursday, 3:00–5:00 PM.\n\nDrop in if you want to go over the material, get feedback on your project proposal, or talk about your study plan for the term.\n\nSee you there!",
  },
];

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true } });
  let created = 0;

  for (const user of users) {
    for (const message of instructorMessages) {
      const existing = await prisma.message.findFirst({
        where: { recipientId: user.id, senderName: 'Instructor', subject: message.subject },
        select: { id: true },
      });

      if (!existing) {
        await prisma.message.create({
          data: {
            subject: message.subject,
            body: message.body,
            senderId: null,
            senderName: 'Instructor',
            recipientId: user.id,
          },
        });
        created++;
      }
    }
  }

  console.log(`Seeded ${created} instructor messages for ${users.length} user(s)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
