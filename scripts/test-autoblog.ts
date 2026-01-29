import { generatePostForCategory } from '../lib/autoblog';
import { prisma } from '../lib/prisma';

async function testAutoblog() {
  console.log('🧪 Testing Auto-Blog with Media APIs...\n');
  
  // Get first POST category
  const category = await prisma.category.findFirst({ 
    where: { type: 'POST' } 
  });
  
  if (!category) {
    console.log('❌ No POST categories found. Run: npx prisma db seed');
    return;
  }
  
  console.log(`📁 Testing with category: ${category.name}`);
  console.log(`🔑 Unsplash API Key: ${process.env.UNSPLASH_ACCESS_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`🔑 YouTube API Key: ${process.env.YOUTUBE_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`🔑 OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Missing'}\n`);
  
  const postId = await generatePostForCategory(category.id);
  
  if (postId) {
    const post = await prisma.post.findUnique({ 
      where: { id: postId },
      include: { category: true }
    });
    
    console.log('\n═══════════════════════════════════════');
    console.log('✅ POST CREATED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════');
    console.log(`📝 Title: ${post?.title}`);
    console.log(`🏷️ Category: ${post?.category?.name}`);
    console.log(`📷 Featured Image: ${post?.image?.substring(0, 70)}...`);
    
    if (post?.images) {
      const galleryImages = JSON.parse(post.images);
      console.log(`🖼️ Gallery: ${galleryImages.length} images`);
      galleryImages.forEach((url: string, i: number) => {
        console.log(`   ${i + 1}. ${url.substring(0, 60)}...`);
      });
    }
    
    console.log(`🎬 Video: ${post?.videoUrl}`);
    console.log(`📄 Published: ${post?.published ? 'Yes' : 'Draft'}`);
    console.log('═══════════════════════════════════════\n');
  } else {
    console.log('❌ Failed to create post');
  }
  
  await prisma.$disconnect();
}

testAutoblog().catch(console.error);
