import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const USERS = 10;
const POSTS = 25;
const TAGS = 15;

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Users
  const users = [];
  console.log(`👥 Creating ${USERS} users...`);
  for (let i = 0; i < USERS; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      },
    });
    users.push(user);
    console.log(`✅ Created user ${i + 1}/${USERS}`);
  }

  // 2. Create Tags
  const tags = [];
  console.log(`🏷️ Creating ${TAGS} tags...`);
  for (let i = 0; i < TAGS; i++) {
    const tag = await prisma.tag.create({
      data: { name: faker.lorem.word() },
    });
    tags.push(tag);
    console.log(`✅ Created tag ${i + 1}/${TAGS}`);
  }

  // 3. Create Posts
  console.log(`📝 Creating ${POSTS} posts...`);
  for (let i = 0; i < POSTS; i++) {
    const author = faker.helpers.arrayElement(users);
    const selectedTags = faker.helpers.uniqueArray(tags, faker.number.int({ min: 1, max: 3 }));
    const post = await prisma.post.create({
      data: {
        userId: author.id,
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(2),
        status: 'PUBLISHED',
        postTags: {
          create: selectedTags.map(tag => ({
            tag: { connect: { id: tag.id } },
          })),
        },
      },
    });
    console.log(`🟩 Created post ${i + 1}/${POSTS} by ${author.name}`);

    // 4. Add Comments
    const numComments = faker.number.int({ min: 10, max: 20 });
    const postComments = [];
    for (let j = 0; j < numComments; j++) {
      const commenter = faker.helpers.arrayElement(users);
      const comment = await prisma.comment.create({
        data: {
          userId: commenter.id,
          postId: post.id,
          content: faker.lorem.sentence(),
        },
      });
      postComments.push(comment);
    }
    console.log(`💬 Added ${numComments} comments to post ${i + 1}`);

    // 5. Replies
    const numReplies = faker.number.int({ min: 2, max: 10 });
    for (let k = 0; k < numReplies; k++) {
      const parent = faker.helpers.arrayElement(postComments);
      const replier = faker.helpers.arrayElement(users);
      await prisma.comment.create({
        data: {
          userId: replier.id,
          postId: post.id,
          parentCommentId: parent.id,
          content: faker.lorem.sentences(2),
        },
      });
    }
    console.log(`🔁 Added ${numReplies} replies to comments on post ${i + 1}`);

    // 6. Answers
    const numAnswers = faker.number.int({ min: 0, max: 2 });
    for (let a = 0; a < numAnswers; a++) {
      const ansUser = faker.helpers.arrayElement(users);
      const answer = await prisma.answer.create({
        data: {
          userId: ansUser.id,
          postId: post.id,
          content: faker.lorem.paragraph(),
        },
      });

      // 7. Comments on Answers
      const answerComments = faker.number.int({ min: 3, max: 10 });
      for (let c = 0; c < answerComments; c++) {
        const commenter = faker.helpers.arrayElement(users);
        await prisma.comment.create({
          data: {
            userId: commenter.id,
            answerId: answer.id,
            content: faker.lorem.sentence(),
          },
        });
      }

      // 8. Likes on Answers
      const likes = faker.helpers.arrayElements(users, faker.number.int({ min: 0, max: 5 }));
      for (let l of likes) {
        await prisma.like.create({
          data: {
            userId: l.id,
            answerId: answer.id,
          },
        });
      }
      console.log(`📩 Added answer ${a + 1}/${numAnswers} to post ${i + 1} with ${answerComments} comments and ${likes.length} likes`);
    }

    // 9. Likes on post
    const postLikes = faker.helpers.arrayElements(users, faker.number.int({ min: 0, max: 8 }));
    for (let u of postLikes) {
      await prisma.like.create({
        data: {
          userId: u.id,
          postId: post.id,
        },
      });
    }
    console.log(`👍 Post ${i + 1} got ${postLikes.length} likes`);

    // 10. Likes on comments
    for (let com of postComments) {
      const likeUsers = faker.helpers.arrayElements(users, faker.number.int({ min: 0, max: 3 }));
      for (let l of likeUsers) {
        await prisma.like.create({
          data: {
            userId: l.id,
            commentId: com.id,
          },
        });
      }
    }
    console.log(`❤️ Comments on post ${i + 1} received likes`);
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
