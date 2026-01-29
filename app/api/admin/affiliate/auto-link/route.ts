/**
 * Admin API - Auto-Linking Preview and Processing
 * 
 * POST /api/admin/affiliate/auto-link/preview - Preview auto-linking on content
 * POST /api/admin/affiliate/auto-link/process - Process and save auto-linked content
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { 
  previewInsertions, 
  processPostContent, 
  batchProcessPosts,
  type AutoLinkConfig 
} from '@/lib/affiliate/auto-linker';

// POST - Preview auto-linking on content
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, content, postId, postIds, config } = body as {
      action: 'preview' | 'process' | 'batch';
      content?: string;
      postId?: string;
      postIds?: string[];
      config?: Partial<AutoLinkConfig>;
    };

    switch (action) {
      case 'preview': {
        if (!content) {
          return NextResponse.json(
            { error: 'Content is required for preview' },
            { status: 400 }
          );
        }

        const result = await previewInsertions(content);
        return NextResponse.json({ result });
      }

      case 'process': {
        if (!postId) {
          return NextResponse.json(
            { error: 'Post ID is required' },
            { status: 400 }
          );
        }

        const result = await processPostContent(postId, true);
        
        if (!result) {
          return NextResponse.json(
            { error: 'Post not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({ 
          result,
          saved: true,
        });
      }

      case 'batch': {
        if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
          return NextResponse.json(
            { error: 'Post IDs array is required' },
            { status: 400 }
          );
        }

        // Limit batch size
        if (postIds.length > 50) {
          return NextResponse.json(
            { error: 'Maximum 50 posts per batch' },
            { status: 400 }
          );
        }

        const results = await batchProcessPosts(postIds, true);
        
        const summary = {
          processed: results.size,
          totalLinksInserted: 0,
          postsWithLinks: 0,
        };

        for (const result of results.values()) {
          summary.totalLinksInserted += result.insertedLinks.length;
          if (result.insertedLinks.length > 0) {
            summary.postsWithLinks++;
          }
        }

        return NextResponse.json({
          summary,
          results: Object.fromEntries(results),
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: preview, process, or batch' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Auto-linking error:', error);
    return NextResponse.json(
      { error: 'Auto-linking failed' },
      { status: 500 }
    );
  }
}
