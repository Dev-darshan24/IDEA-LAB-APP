import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export interface ApplyFormConfig {
  titleQuestion: string;
  problemQuestion: string;
  descriptionQuestion: string;
  requirePdfUpload: boolean;
  eligibilityNote: string;
}

const DEFAULT_CONFIG: ApplyFormConfig = {
  titleQuestion: 'What is your Innovation Project / Idea Title?',
  problemQuestion: 'Describe the Problem Statement & Technical Challenge',
  descriptionQuestion: 'Detailed Project Abstract & Proposed Hardware/Software Solution',
  requirePdfUpload: true,
  eligibilityNote: 'Open for all student innovators & faculty teams at TGPCET AICTE IDEA LAB.',
};

export async function GET() {
  try {
    // 1. Try fetching from dedicated project_form_settings table
    const { data: pfsData, error: pfsErr } = await supabase
      .from('project_form_settings')
      .select('*')
      .eq('id', 'main_config')
      .maybeSingle();

    if (!pfsErr && pfsData) {
      return NextResponse.json({
        success: true,
        config: {
          titleQuestion: pfsData.title_question || DEFAULT_CONFIG.titleQuestion,
          problemQuestion: pfsData.problem_question || DEFAULT_CONFIG.problemQuestion,
          descriptionQuestion: pfsData.description_question || DEFAULT_CONFIG.descriptionQuestion,
          requirePdfUpload: pfsData.require_pdf_upload !== undefined ? Boolean(pfsData.require_pdf_upload) : true,
          eligibilityNote: pfsData.eligibility_note || DEFAULT_CONFIG.eligibilityNote,
        },
      });
    }

    // 2. Fallback check on site_contact table
    const { data, error } = await supabase
      .from('site_contact')
      .select('*')
      .eq('id', 'apply-config-main')
      .maybeSingle();

    if (!error && data && data.address) {
      try {
        const parsed = JSON.parse(data.address);
        if (parsed && parsed.titleQuestion) {
          return NextResponse.json({ success: true, config: parsed });
        }
      } catch (pErr) {}
    }
  } catch (e: any) {
    console.warn('[GET /api/apply-config] Supabase query warning:', e?.message || e);
  }

  return NextResponse.json({ success: true, config: DEFAULT_CONFIG });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const config: ApplyFormConfig = {
      titleQuestion: body.titleQuestion || DEFAULT_CONFIG.titleQuestion,
      problemQuestion: body.problemQuestion || DEFAULT_CONFIG.problemQuestion,
      descriptionQuestion: body.descriptionQuestion || DEFAULT_CONFIG.descriptionQuestion,
      requirePdfUpload: body.requirePdfUpload !== undefined ? Boolean(body.requirePdfUpload) : true,
      eligibilityNote: body.eligibilityNote || DEFAULT_CONFIG.eligibilityNote,
    };

    // 1. Upsert into dedicated project_form_settings table
    const dbPayload = {
      id: 'main_config',
      title_question: config.titleQuestion,
      problem_question: config.problemQuestion,
      description_question: config.descriptionQuestion,
      require_pdf_upload: config.requirePdfUpload,
      eligibility_note: config.eligibilityNote,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertErr } = await supabase
      .from('project_form_settings')
      .upsert([dbPayload], { onConflict: 'id' });

    if (upsertErr) {
      console.warn('[POST /api/apply-config] project_form_settings upsert error:', upsertErr.message);
    }

    // 2. Backup to site_contact table
    const backupPayload = {
      id: 'apply-config-main',
      email_primary: 'idealab@tgpcet.com',
      phone_primary: '+91 712 2810001',
      address: JSON.stringify(config),
      updated_at: new Date().toISOString(),
    };

    await supabase.from('site_contact').upsert([backupPayload], { onConflict: 'id' });

    return NextResponse.json({
      success: true,
      message: 'Project Form settings saved permanently to Supabase database!',
      config,
    });
  } catch (e: any) {
    console.error('[POST /api/apply-config] Error:', e);
    return NextResponse.json(
      { success: false, message: e.message || 'Failed to save project form settings.' },
      { status: 500 }
    );
  }
}
