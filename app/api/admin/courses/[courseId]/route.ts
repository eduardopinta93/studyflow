import { NextRequest, NextResponse } from 'next/server';
import { deleteCourseCascade, requireAdmin } from '@/lib/admin';

type Params = { params: Promise<{ courseId: string }> };

export async function DELETE(_request: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const { courseId } = await params;

    try {
      await deleteCourseCascade(courseId);
    } catch {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, id: courseId });
  } catch (error) {
    console.error('DELETE /api/admin/courses/[courseId] error:', error);
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}
