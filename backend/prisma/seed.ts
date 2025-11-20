import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed...');

    // 1. Create Admin
    const adminEmail = 'admin@wecareu.com';
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: { password_hash: hashedPassword, status: 'ACTIVE', role: 'ADMIN' },
        create: { full_name: 'Super Admin', email: adminEmail, password_hash: hashedPassword, role: 'ADMIN', status: 'ACTIVE' }
    });
    console.log('Admin seeded');

    // 2. Create Counselors
    const counselorsData = [
        { name: 'Dr. Sarah Johnson', email: 'sarah@wecareu.com', spec: 'Anxiety & Depression', exp: 5 },
        { name: 'Dr. Michael Chen', email: 'michael@wecareu.com', spec: 'Career Counseling', exp: 8 },
        { name: 'Ms. Emily Davis', email: 'emily@wecareu.com', spec: 'Relationship Issues', exp: 3 }
    ];

    const counselors = [];
    for (const c of counselorsData) {
        const pass = await bcrypt.hash('counselor123', 10);
        const user = await prisma.user.upsert({
            where: { email: c.email },
            update: { password_hash: pass, status: 'ACTIVE' },
            create: { full_name: c.name, email: c.email, password_hash: pass, role: 'COUNSELOR', status: 'ACTIVE' }
        });
        counselors.push(user);

        const existingDetails = await prisma.counselorDetails.findUnique({ where: { user_id: user.id } });
        if (!existingDetails) {
            await prisma.counselorDetails.create({
                data: {
                    user_id: user.id,
                    specialization: c.spec,
                    years_experience: c.exp,
                    available_days: ['Monday', 'Wednesday', 'Friday']
                }
            });
        }
    }
    console.log('Counselors seeded');

    // 3. Create Students
    const studentsData = [
        { name: 'John Doe', email: 'john@student.telkomuniversity.ac.id', nim: '1234567890' },
        { name: 'Jane Smith', email: 'jane@student.telkomuniversity.ac.id', nim: '0987654321' },
        { name: 'Budi Santoso', email: 'budi@student.telkomuniversity.ac.id', nim: '1122334455' }
    ];

    const students = [];
    for (const s of studentsData) {
        const pass = await bcrypt.hash('student123', 10);
        const user = await prisma.user.upsert({
            where: { email: s.email },
            update: { password_hash: pass, status: 'ACTIVE' },
            create: { full_name: s.name, email: s.email, nim: s.nim, password_hash: pass, role: 'STUDENT', status: 'ACTIVE' }
        });
        students.push(user);
    }
    console.log('Students seeded');

    // 4. Stress Questions
    const questionsData = [
        { question_text: 'Saya merasa sulit untuk menenangkan diri', dimension: 'Stress' },
        { question_text: 'Saya menyadari mulut saya kering', dimension: 'Anxiety' },
        { question_text: 'Saya tidak dapat melihat hal yang positif dari suatu kejadian', dimension: 'Depression' },
        { question_text: 'Saya mengalami kesulitan bernafas (misalnya: nafas cepat, terengah-engah)', dimension: 'Anxiety' },
        { question_text: 'Saya merasa sepertinya tidak kuat lagi untuk melakukan suatu kegiatan', dimension: 'Depression' },
        { question_text: 'Saya cenderung bereaksi berlebihan pada situasi', dimension: 'Stress' },
        { question_text: 'Saya merasa gemetar (misalnya: pada tangan)', dimension: 'Anxiety' },
        { question_text: 'Saya merasa sulit untuk rileks', dimension: 'Stress' },
        { question_text: 'Saya berada dalam keadaan cemas yang berlebihan', dimension: 'Anxiety' },
        { question_text: 'Saya merasa tidak ada hal yang dapat diharapkan di masa depan', dimension: 'Depression' },
    ];

    const questions = [];
    for (const q of questionsData) {
        const existing = await prisma.stressQuestion.findFirst({ where: { question_text: q.question_text } });
        if (!existing) {
            const newQ = await prisma.stressQuestion.create({ data: { question_text: q.question_text, dimension: q.dimension } });
            questions.push(newQ);
        } else {
            questions.push(existing);
        }
    }
    console.log('Stress questions seeded');

    // 5. Sessions & Chat
    // Session 1: John & Sarah (Approved)
    const session1 = await prisma.session.create({
        data: {
            student_id: students[0].id,
            counselor_id: counselors[0].id,
            scheduled_start: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
            scheduled_end: new Date(new Date().setDate(new Date().getDate() + 1)),
            status: 'APPROVED'
        }
    });

    // Chat for Session 1
    const chatSession1 = await prisma.chatSession.create({ data: { session_id: session1.id } });
    await prisma.chatMessage.createMany({
        data: [
            { chat_session_id: chatSession1.id, sender_id: students[0].id, message_text: 'Hello Dr. Sarah, I am feeling anxious lately.' },
            { chat_session_id: chatSession1.id, sender_id: counselors[0].id, message_text: 'Hi John, I am here to help. Can you tell me more?' }
        ]
    });

    // Session 2: Jane & Michael (Pending)
    await prisma.session.create({
        data: {
            student_id: students[1].id,
            counselor_id: counselors[1].id,
            scheduled_start: new Date(new Date().setDate(new Date().getDate() + 2)),
            scheduled_end: new Date(new Date().setDate(new Date().getDate() + 2)),
            status: 'PENDING'
        }
    });

    // Session 3: Budi & Emily (Completed)
    await prisma.session.create({
        data: {
            student_id: students[2].id,
            counselor_id: counselors[2].id,
            scheduled_start: new Date(new Date().setDate(new Date().getDate() - 5)),
            scheduled_end: new Date(new Date().setDate(new Date().getDate() - 5)),
            status: 'COMPLETED'
        }
    });
    console.log('Sessions and chats seeded');

    // 6. Stress Test Results
    await prisma.stressTest.create({
        data: {
            student_id: students[0].id,
            total_score: 15,
            category: 'SEDANG',
            scale_name: 'DASS-21 Simplified',
            answers: {
                create: questions.slice(0, 5).map(q => ({ question_id: q.id, answer_value: 3 }))
            }
        }
    });
    console.log('Stress test results seeded');

    // 7. Articles
    const articlesData = [
        { title: 'Understanding Anxiety', category: 'Anxiety', content: 'Anxiety is a normal emotion...' },
        { title: 'Tips for Better Sleep', category: 'Self-Care', content: 'Sleep is essential...' },
        { title: 'Coping with Academic Stress', category: 'Stress', content: 'Academic pressure is real...' },
        { title: 'Building Healthy Relationships', category: 'Relationships', content: 'Communication is key...' }
    ];

    for (const art of articlesData) {
        const existing = await prisma.article.findFirst({ where: { title: art.title } });
        if (!existing) {
            await prisma.article.create({
                data: {
                    title: art.title,
                    content: art.content,
                    category: art.category,
                    author_id: admin.id,
                    is_published: true,
                    thumbnail_url: 'https://source.unsplash.com/random/800x600/?mental-health'
                }
            });
        }
    }
    console.log('Articles seeded');

    // 8. Notifications
    await prisma.notification.createMany({
        data: [
            { user_id: students[0].id, type: 'SESSION', title: 'Session Approved', body: 'Your session with Dr. Sarah has been approved.' },
            { user_id: counselors[0].id, type: 'SESSION', title: 'New Session Request', body: 'You have a new session request from John Doe.' }
        ]
    });
    console.log('Notifications seeded');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
