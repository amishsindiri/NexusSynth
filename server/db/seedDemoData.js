import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query } from './pool.js';

export const DEMO_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  fullName: 'Dr. Elena Rostova',
  email: 'demo@nexussynth.ai',
  password: 'DemoPass123!',
  institution: 'Genomic Delivery Systems Consortium (GDSC)',
  primaryDomain: 'CLINICAL_BIOTECH',
};

export const DEMO_WORKSPACE_ID = '00000000-0000-0000-0000-000000000010';
export const DEMO_SOURCE_1_ID = '00000000-0000-0000-0000-000000000101';
export const DEMO_SOURCE_2_ID = '00000000-0000-0000-0000-000000000102';
export const DEMO_SOURCE_3_ID = '00000000-0000-0000-0000-000000000103';
export const DEMO_SYNTHESIS_ID = '00000000-0000-0000-0000-000000000201';

export async function seedDemoData() {
  try {
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [DEMO_USER.email]);
    if (existingUser.rows && existingUser.rows.length > 0) {
      console.log('ℹ️ Demo account already exists. Skipping seed.');
      return;
    }

    console.log('🌱 Seeding demo account and research workspace...');
    const passwordHash = await bcrypt.hash(DEMO_USER.password, 10);

    // 1. Create Demo User
    await query(
      `INSERT INTO users (id, full_name, email, password_hash, institution, primary_domain)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        DEMO_USER.id,
        DEMO_USER.fullName,
        DEMO_USER.email,
        passwordHash,
        DEMO_USER.institution,
        DEMO_USER.primaryDomain,
      ]
    );

    // 2. Create Demo Workspace
    await query(
      `INSERT INTO workspaces (id, user_id, title, domain, research_question, description)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        DEMO_WORKSPACE_ID,
        DEMO_USER.id,
        'Ionizable Lipid Nanoparticles & mRNA Transfection Optimization',
        'CLINICAL_BIOTECH',
        'How do headgroup structural variations and N/P charge ratios in synthetic ionizable LNPs govern in-vivo hepatic endosomal escape efficiency and immunogenicity?',
        'Comparative investigation across 2024-2026 pre-clinical and Phase I clinical trial data for next-generation lipid nanoparticle mRNA delivery vectors.',
      ]
    );

    // 3. Ingest Demo Source 1
    const source1Text = `Title: Systematic Evaluation of Biodegradable Ester-Linked Ionizable Lipids for Hepatic mRNA Delivery
Authors: Chen, H., Varghese, M., & Al-Mansoor, K.
Publication Year: 2025
Journal: Journal of Controlled Release, Vol. 382, pp. 114-129.

Abstract & Findings:
Lipid nanoparticles (LNPs) remain the gold standard for therapeutic mRNA delivery, yet long-term hepatic accumulation presents hepatotoxicity hurdles. In this study, we evaluated a library of six novel biodegradable ionizable lipids containing secondary ester linkages in the hydrophobic alkyl tails. 

Methodology:
Formulation assays utilized a microfluidic herringbone mixing device operating at a 3:1 aqueous to ethanol ratio. Formulations were characterized via dynamic light scattering (DLS) and cryogenic transmission electron microscopy (cryo-TEM). Murine models (n=72 BALB/c mice) were administered 0.5 mg/kg luciferase mRNA intravenously. Pharmacokinetic biodistribution and ALT/AST liver enzyme levels were assayed at 6, 24, and 72 hours post-administration.

Results:
Formulation LNP-EST4 achieved 89.4% encapsulation efficiency with an average hydrodynamic diameter of 68.2 nm and a polydispersity index (PDI) of 0.082. Crucially, hepatic endosomal escape efficiency was measured at 14.2% using galectin-8 recruitment puncta imaging, representing a 2.3-fold increase over benchmark MC3 LNPs (6.1%). Biodegradation analysis indicated a 4.1-hour hepatic half-life for LNP-EST4 versus 36 hours for ALC-0315. Serum alanine transaminase (ALT) was maintained below 45 U/L at 72 hours, demonstrating superior tolerability.

Limitations:
Testing was restricted to rodent models; higher non-human primate clearance kinetics and complement activation-related pseudoallergy (CARPA) were not evaluated.`;

    const source1Claims = [
      {
        claim: "Secondary ester-linked ionizable lipid LNP-EST4 improves endosomal escape efficiency to 14.2%, a 2.3-fold improvement over MC3 (6.1%).",
        supporting_evidence: "Galectin-8 recruitment puncta fluorescence microscopy quantified escape in BALB/c hepatocyte cultures at 0.5 mg/kg dosing.",
        confidence: "HIGH",
        relevance_to_workspace: "Directly solves the primary endosomal escape bottleneck in mRNA delivery."
      },
      {
        claim: "Ester linkages reduce hepatic clearance half-life to 4.1 hours without attenuating peak luciferase expression.",
        supporting_evidence: "Pharmacokinetic clearance assays measured 4.1h half-life vs 36h for commercial ALC-0315 benchmark with normal ALT < 45 U/L.",
        confidence: "HIGH",
        relevance_to_workspace: "Mitigates repeated-dosing hepatotoxicity concerns in chronic therapies."
      },
      {
        claim: "Hydrodynamic diameter below 70 nm with PDI < 0.1 prevents splenic sequestration.",
        supporting_evidence: "DLS measurements confirmed 68.2 nm size, with 88% biodistribution localized strictly to the liver parenchyma.",
        confidence: "MODERATE",
        relevance_to_workspace: "Validates formulation reproducibility and size-dependent tissue selectivity."
      }
    ];

    const source1Entities = ["LNP-EST4", "Ionizable Lipids", "Endosomal Escape", "Galectin-8", "Encapsulation Efficiency", "BALB/c Mice", "Biodegradation", "Hepatotoxicity", "ALC-0315", "Polydispersity Index"];
    const source1Metrics = [
      { metric_name: "Encapsulation Efficiency", value: "89.4%", context: "Microfluidic herringbone mixing formulation" },
      { metric_name: "Endosomal Escape Rate", value: "14.2%", context: "Galectin-8 puncta assay (2.3x over MC3)" },
      { metric_name: "Hepatic Half-Life", value: "4.1 hours", context: "vs 36 hours for standard ALC-0315" },
      { metric_name: "Particle Diameter", value: "68.2 nm", context: "PDI 0.082 measured by dynamic light scattering" }
    ];

    await query(
      `INSERT INTO sources (id, workspace_id, user_id, title, authors, publication_year, source_type, raw_text, word_count, ai_summary, methodology_notes, limitations, key_claims, entities, key_metrics)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        DEMO_SOURCE_1_ID,
        DEMO_WORKSPACE_ID,
        DEMO_USER.id,
        'Systematic Evaluation of Biodegradable Ester-Linked Ionizable Lipids for Hepatic mRNA Delivery',
        'Chen, H., Varghese, M., & Al-Mansoor, K.',
        2025,
        'PEER_REVIEWED_PAPER',
        source1Text,
        source1Text.split(/\s+/).length,
        'The authors developed LNP-EST4, an ester-cleavable ionizable lipid exhibiting 14.2% endosomal escape and a 4.1-hour hepatic half-life in mice. The design dramatically reduces liver toxicity while maintaining high luciferase expression relative to legacy MC3 and ALC-0315 formulations.',
        'Microfluidic staggered herringbone mixing (3:1 aqueous:ethanol ratio) followed by in-vivo BALB/c murine PK and Galectin-8 endosomal tracking.',
        'Study conducted exclusively in rodent models (BALB/c); lacks evaluation of CARPA or primate immunological responses.',
        JSON.stringify(source1Claims),
        JSON.stringify(source1Entities),
        JSON.stringify(source1Metrics),
      ]
    );

    // 4. Ingest Demo Source 2
    const source2Text = `Title: Charge-Altering Branching Morphologies Drive Cytoplasmic Delivery at Lower N/P Ratios
Authors: Tanaka, R., Bergstrom, S., & Dupont, T.
Publication Year: 2024
Journal: Nature Biomedical Engineering, Vol. 8, pp. 912-928.

Abstract & Findings:
Optimizing the amine-to-phosphate (N/P) charge ratio is critical to balancing mRNA packaging stability with host cellular membrane destabilization. Here we present a library of multi-branched tertiary amine core lipids (BTA-9) capable of complete mRNA complexation at an ultra-low N/P ratio of 3.0.

Methodology:
Robotic high-throughput combinatorial synthesis produced 48 branched lipid variants. Formulations were tested in vitro on human primary hepatocytes and in vivo in cynomolgus macaques (n=6) at a clinical dose of 0.3 mg/kg. Inflammatory cytokine panels (IL-6, TNF-alpha, IFN-gamma) and complement activation were monitored via ELISA.

Results:
BTA-9 demonstrated complete mRNA condensation at N/P 3:1, contrasting with conventional requirements of N/P 6:1 or 8:1. In cynomolgus primates, BTA-9 achieved protein translation levels comparable to N/P 6:1 benchmarks, while systemic IL-6 levels remained under 12 pg/mL (versus 185 pg/mL in high-N/P cohorts). However, endosomal escape efficiency plateaued at 9.8%, indicating that while low charge substantially suppresses inflammatory shock, cytoplasmic membrane translocation remains suboptimal compared to specialized ester-cleavable architectures.

Limitations:
Long-term stability at 4°C is restricted to 21 days due to premature micellar restructuring. Requires cryopreservation with 10% trehalose.`;

    const source2Claims = [
      {
        claim: "Multi-branched tertiary amine core (BTA-9) reduces required N/P ratio to 3:1 while preserving robust non-human primate translation.",
        supporting_evidence: "Evaluated in n=6 cynomolgus macaques at 0.3 mg/kg dosing with comparable protein expression to N/P 6:1.",
        confidence: "HIGH",
        relevance_to_workspace: "Provides evidence on charge-ratio modulation to reduce reactogenicity."
      },
      {
        claim: "Lowering N/P ratio to 3.0 suppresses systemic IL-6 release below 12 pg/mL vs 185 pg/mL for N/P 6.0.",
        supporting_evidence: "Primate serum cytokine ELISA profiles taken at 4 hours post-infusion showed 93% cytokine abatement.",
        confidence: "HIGH",
        relevance_to_workspace: "Validates low-charge formulation as a key strategy against cytokine release syndrome."
      },
      {
        claim: "Low N/P formulations cap endosomal release around 9.8%, revealing an inherent trade-off between immunogenicity suppression and cytoplasmic yield.",
        supporting_evidence: "Translocation assays yielded 9.8% escape, significantly below the 14%+ observed in higher charge density lipids.",
        confidence: "MODERATE",
        relevance_to_workspace: "Highlights critical contradiction and engineering trade-off across formulation approaches."
      }
    ];

    const source2Entities = ["BTA-9", "N/P Charge Ratio", "Cynomolgus Macaques", "IL-6 Cytokine", "Endosomal Escape", "Trehalose", "High-Throughput Synthesis", "Primary Hepatocytes", "Immunogenicity"];
    const source2Metrics = [
      { metric_name: "Optimal N/P Ratio", value: "3:1", context: "vs traditional 6:1 or 8:1 requirements" },
      { metric_name: "Systemic IL-6 Level", value: "< 12 pg/mL", context: "compared to 185 pg/mL for standard formulations" },
      { metric_name: "Endosomal Escape Plateau", value: "9.8%", context: "in primary human hepatocytes" },
      { metric_name: "Primate Dosing Efficacy", value: "0.3 mg/kg", context: "in cynomolgus macaques (n=6)" }
    ];

    await query(
      `INSERT INTO sources (id, workspace_id, user_id, title, authors, publication_year, source_type, raw_text, word_count, ai_summary, methodology_notes, limitations, key_claims, entities, key_metrics)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        DEMO_SOURCE_2_ID,
        DEMO_WORKSPACE_ID,
        DEMO_USER.id,
        'Charge-Altering Branching Morphologies Drive Cytoplasmic Delivery at Lower N/P Ratios',
        'Tanaka, R., Bergstrom, S., & Dupont, T.',
        2024,
        'PEER_REVIEWED_PAPER',
        source2Text,
        source2Text.split(/\s+/).length,
        'This study explores branched tertiary amine lipid BTA-9, achieving full mRNA condensation at an N/P ratio of 3:1. When evaluated in cynomolgus primates, it reduced systemic IL-6 release to under 12 pg/mL, though endosomal escape peaked at 9.8%.',
        'Combinatorial synthesis of 48 branched lipids; tested in human hepatocytes and in-vivo cynomolgus macaque primate models (n=6) with cytokine ELISA profiling.',
        'Short liquid shelf-life (21 days at 4°C); requires 10% trehalose cryoprotectant to avoid particle aggregation.',
        JSON.stringify(source2Claims),
        JSON.stringify(source2Entities),
        JSON.stringify(source2Metrics),
      ]
    );

    // 5. Ingest Demo Source 3
    const source3Text = `Title: Persistent Toll-Like Receptor 4 Activation by Synthetic Lipid Headgroups in Repeat Dosing Regimens
Authors: O'Connor, P., & Morales, G.
Publication Year: 2026
Journal: Clinical & Experimental Immunology, Vol. 215, Issue 2, pp. 201-218.

Abstract & Findings:
Repeated administration of mRNA therapeutics frequently induces accelerated blood clearance (ABC) and elevated anti-PEG or anti-lipid antibodies. This clinical study investigated 42 patients undergoing personalized mRNA immunotherapy to determine the molecular triggers of lipid-mediated reactogenicity.

Methodology:
PBMCs and serum samples from 42 clinical trial participants were collected longitudinal across four consecutive bi-weekly infusions. Serum complement factors (Bb, sC5b-9), anti-lipid IgG/IgM titers, and monocyte TLR4 activation states were quantified via flow cytometry and surface plasmon resonance.

Results:
We observed that tertiary amine headgroups with rigid planar structures stimulated TLR4 dimerization, triggering chronic sub-clinical NF-kB signaling in 64% of participants. Surprisingly, even at lower N/P ratios (3.5 - 4.0), persistent TLR4 activation occurred if the lipid hydrophobic scaffold exhibited slow biodegradation (> 24h). Conversely, rapid-clearing ester lipids demonstrated an 81% reduction in chronic TLR4 engagement. Furthermore, neutralizing antibody titers against the lipid particle peaked at week 6, resulting in a 44% attenuation of therapeutic mRNA expression unless dose intervals exceeded 28 days.

Limitations:
Patient cohort was limited to oncology candidates who had received prior adjuvant chemotherapy, which may prime baseline innate immunity.`;

    const source3Claims = [
      {
        claim: "Persistent TLR4 activation is primarily governed by slow clearance half-life rather than initial N/P charge ratio alone.",
        supporting_evidence: "64% of patients exhibited NF-kB signaling when lipid clearance half-life exceeded 24 hours, even at low N/P ratios of 3.5.",
        confidence: "HIGH",
        relevance_to_workspace: "Contradicts the assumption that low N/P alone guarantees immunological silence."
      },
      {
        claim: "Accelerated blood clearance (ABC) reduces therapeutic mRNA expression by 44% upon repeated bi-weekly dosing.",
        supporting_evidence: "Longitudinal serum anti-lipid IgG/IgM assays across 42 patients revealed expression loss by week 6.",
        confidence: "HIGH",
        relevance_to_workspace: "Direct implications for repeat dosing schedules in clinical protocols."
      },
      {
        claim: "Rapid ester-cleavable scaffolds attenuate chronic TLR4 engagement by 81%.",
        supporting_evidence: "Sub-cohort analysis confirmed ester-linked lipids prevented persistent monocyte activation.",
        confidence: "MODERATE",
        relevance_to_workspace: "Corroborates the safety profile of biodegradable ester architectures."
      }
    ];

    const source3Entities = ["TLR4", "NF-kB Signaling", "Accelerated Blood Clearance (ABC)", "Anti-Lipid Antibodies", "Repeat Dosing", "Flow Cytometry", "Human Clinical Trial", "Ester Cleavage", "Immunotherapy"];
    const source3Metrics = [
      { metric_name: "Clinical Trial Cohort", value: "42 patients", context: "Longitudinal 4-dose evaluation" },
      { metric_name: "TLR4 Activation Rate", value: "64%", context: "in lipids with clearance half-life > 24 hours" },
      { metric_name: "Expression Attenuation", value: "44%", context: "at week 6 under bi-weekly administration" },
      { metric_name: "Ester Lipid TLR4 Reduction", value: "81%", context: "reduction in chronic innate immune activation" }
    ];

    await query(
      `INSERT INTO sources (id, workspace_id, user_id, title, authors, publication_year, source_type, raw_text, word_count, ai_summary, methodology_notes, limitations, key_claims, entities, key_metrics)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        DEMO_SOURCE_3_ID,
        DEMO_WORKSPACE_ID,
        DEMO_USER.id,
        'Persistent Toll-Like Receptor 4 Activation by Synthetic Lipid Headgroups in Repeat Dosing Regimens',
        "O'Connor, P., & Morales, G.",
        2026,
        'PEER_REVIEWED_PAPER',
        source3Text,
        source3Text.split(/\s+/).length,
        'This clinical study of 42 human trial subjects establishes that slow lipid degradation (>24h) drives persistent TLR4 dimerization and a 44% drop in mRNA expression on repeat bi-weekly dosing. Fast ester-cleavable lipids reduced chronic TLR4 engagement by 81%.',
        'Longitudinal clinical study (n=42 human oncology patients); four bi-weekly doses with flow cytometry of monocyte TLR4 and surface plasmon resonance for antibody titers.',
        'Participants were oncology patients with previous adjuvant therapies, which might influence baseline innate immune activation thresholds.',
        JSON.stringify(source3Claims),
        JSON.stringify(source3Entities),
        JSON.stringify(source3Metrics),
      ]
    );

    // 6. Pre-generate Demo Synthesis Report
    const demoSynthesisReport = {
      executive_synthesis: "Cross-synthesis of Chen et al. (2025), Tanaka et al. (2024), and O'Connor & Morales (2026) reveals that the central challenge in next-generation mRNA delivery is the tension between cytoplasmic endosomal escape and innate immune silencing. While Tanaka et al. successfully lowered N/P ratios to 3:1 to dampen acute IL-6 release in primates, their endosomal escape plateaued at 9.8%. In contrast, Chen et al.'s ester-cleavable architecture (LNP-EST4) unlocked a superior 14.2% endosomal escape while slashing hepatic half-life to 4.1 hours. Crucially, human clinical data from O'Connor & Morales demonstrates that charge reduction alone is insufficient to prevent repeat-dose immunogenicity: without rapid biodegradation (< 24h), chronic TLR4 activation persists and causes a 44% attenuation of therapeutic expression. Therefore, the optimal vector architecture must combine low N/P charge modulation with ester-cleavable alkyl chains.",
      consensus_points: [
        {
          theme: "Biodegradation is the Primary Determinant of Tolerability",
          synthesis_statement: "Rapid ester-cleavable hydrophobic tails significantly improve both hepatic enzyme profiles (Chen et al.) and prevent chronic TLR4 activation in human patients (O'Connor & Morales).",
          supporting_sources: ["Chen et al. (2025) [Source ID: " + DEMO_SOURCE_1_ID + "]", "O'Connor & Morales (2026) [Source ID: " + DEMO_SOURCE_3_ID + "]"],
          strength_of_agreement: "STRONG"
        },
        {
          theme: "Traditional High N/P Ratios (6:1 - 8:1) Are Superfluous and Deleterious",
          synthesis_statement: "Lowering N/P ratios down to 3.0-3.5 maintains viable mRNA complexation and translational efficacy while drastically curtailing systemic IL-6 spikes.",
          supporting_sources: ["Tanaka et al. (2024) [Source ID: " + DEMO_SOURCE_2_ID + "]", "Chen et al. (2025) [Source ID: " + DEMO_SOURCE_1_ID + "]"],
          strength_of_agreement: "STRONG"
        }
      ],
      contradictions: [
        {
          topic: "Charge Reduction vs. Clearance Velocity as the Driver of Immunological Silence",
          conflicting_positions: "Tanaka et al. assert that lowering N/P ratio to 3:1 is sufficient to avoid immune toxicity (IL-6 < 12 pg/mL in primates). However, O'Connor & Morales show that even at low N/P (3.5), slow clearance (>24h) causes chronic TLR4/NF-kB activation in 64% of human patients.",
          sources_involved: ["Tanaka et al. (2024)", "O'Connor & Morales (2026)"],
          methodological_explanation: "Tanaka et al. measured acute 4-hour cytokine response in naive primates, whereas O'Connor & Morales evaluated repeat chronic bi-weekly dosing in human patients."
        },
        {
          topic: "Endosomal Escape Thresholds",
          conflicting_positions: "Chen et al. report 14.2% escape efficiency using ester linkages, whereas Tanaka's branched amine architecture plateaued at 9.8%.",
          sources_involved: ["Chen et al. (2025)", "Tanaka et al. (2024)"],
          methodological_explanation: "Chen et al. utilized galectin-8 recruitment puncta imaging in murine hepatocytes, while Tanaka relied on in-vitro human primary hepatocyte Luciferase translocation kinetics."
        }
      ],
      research_gaps: [
        {
          gap_title: "Non-Human Primate Evaluation of Ester-Cleavable LNP-EST4",
          description: "Chen et al. evaluated LNP-EST4 strictly in BALB/c mice. Whether the 4.1h half-life holds in primates without triggering accelerated blood clearance (ABC) remains unknown.",
          suggested_next_study: "Conduct pharmacokinetic and CARPA assays in cynomolgus macaques comparing LNP-EST4 vs ALC-0315 at 0.5 mg/kg across 4 doses.",
          priority: "CRITICAL"
        },
        {
          gap_title: "Combinatorial Formulation Merging BTA-9 Low N/P Core with Cleavable Ester Tails",
          description: "Neither study evaluated a hybrid lipid that fuses Tanaka's multi-branched tertiary amine core (for N/P 3:1 complexation) with Chen's ester-cleavable tails (for 14% escape and 4h clearance).",
          suggested_next_study: "Synthesize a hybrid lipid library combining branched amine heads with aliphatic ester linkages and screen for galectin-8 escape and TLR4 dimerization.",
          priority: "HIGH"
        }
      ],
      evidence_matrix: [
        {
          dimension: "Endosomal Escape Rate",
          comparative_finding: "Chen et al.: 14.2% (2.3x over MC3); Tanaka et al.: 9.8%; Legacy MC3: 6.1%.",
          primary_source_ref: "Chen et al. (2025) & Tanaka et al. (2024)",
          evidence_quality: "HIGH"
        },
        {
          dimension: "Systemic Inflammatory Profile",
          comparative_finding: "Tanaka et al. achieved IL-6 < 12 pg/mL; O'Connor et al. identified persistent TLR4 activation in 64% without ester clearance.",
          primary_source_ref: "Tanaka et al. (2024) & O'Connor & Morales (2026)",
          evidence_quality: "HIGH"
        },
        {
          dimension: "In-Vivo Hepatic Clearance Half-Life",
          comparative_finding: "Chen et al. recorded 4.1h for ester-linked lipids compared to 36h for ALC-0315.",
          primary_source_ref: "Chen et al. (2025)",
          evidence_quality: "HIGH"
        }
      ],
      recommendations: [
        {
          action: "Design hybrid formulations that adopt N/P 3.0 complexation with secondary ester alkyl tail cleavage.",
          rationale: "Leverages Tanaka's low-charge immunogenicity advantage while capturing Chen's 14.2% endosomal escape rate.",
          expected_impact: "Overcomes the 9.8% escape ceiling while eliminating repeat-dose TLR4-mediated expression loss."
        },
        {
          action: "Enforce a mandatory > 21-day dose interval for formulations with lipid clearance t1/2 > 12 hours.",
          rationale: "O'Connor & Morales demonstrated a 44% loss of mRNA expression when dosing bi-weekly with slow-clearing carriers.",
          expected_impact: "Prevents accelerated blood clearance and preserves long-term clinical therapeutic efficacy."
        }
      ]
    };

    await query(
      `INSERT INTO syntheses (id, workspace_id, user_id, title, synthesis_mode, focus_directive, source_ids, executive_synthesis, consensus_points, contradictions, research_gaps, evidence_matrix, recommendations)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        DEMO_SYNTHESIS_ID,
        DEMO_WORKSPACE_ID,
        DEMO_USER.id,
        'Comparative Synthesis: Endosomal Escape, Charge Optimization & Immunogenicity in Next-Gen LNPs',
        'CONTRADICTION_MATRIX',
        'Examine the direct trade-offs between N/P charge reduction and endosomal escape efficiency, with particular focus on human repeat-dosing immunogenicity.',
        JSON.stringify([DEMO_SOURCE_1_ID, DEMO_SOURCE_2_ID, DEMO_SOURCE_3_ID]),
        demoSynthesisReport.executive_synthesis,
        JSON.stringify(demoSynthesisReport.consensus_points),
        JSON.stringify(demoSynthesisReport.contradictions),
        JSON.stringify(demoSynthesisReport.research_gaps),
        JSON.stringify(demoSynthesisReport.evidence_matrix),
        JSON.stringify(demoSynthesisReport.recommendations),
      ]
    );

    // 7. Seed Grounded Chat Messages
    const chatMsg1Id = '00000000-0000-0000-0000-000000000301';
    const chatMsg2Id = '00000000-0000-0000-0000-000000000302';

    await query(
      `INSERT INTO chat_messages (id, workspace_id, user_id, role, content)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        chatMsg1Id,
        DEMO_WORKSPACE_ID,
        DEMO_USER.id,
        'user',
        'Which study demonstrated the highest endosomal escape efficiency, and does lowering the N/P ratio affect this rate?',
      ]
    );

    const assistantAnswer = `Based on the ingested workspace corpus:

1. **Highest Endosomal Escape Rate**: 
   **Chen et al. (2025)** demonstrated the highest endosomal escape efficiency at **14.2%** using their biodegradable ester-cleavable lipid (*LNP-EST4*), measured via galectin-8 recruitment puncta imaging. This represented a 2.3-fold increase over the benchmark MC3 lipid (6.1%).

2. **Impact of Lowering the N/P Ratio**:
   **Tanaka et al. (2024)** showed that while lowering the N/P ratio to **3:1** significantly attenuated systemic inflammatory cytokines (IL-6 < 12 pg/mL vs 185 pg/mL at N/P 6:1), the endosomal escape efficiency plateaued at **9.8%**. This indicates a documented trade-off where reducing charge density minimizes acute reactogenicity but constrains membrane destabilization required for endosomal translocation.

Furthermore, **O'Connor & Morales (2026)** noted that lowering the N/P ratio to 3.5 was insufficient by itself to prevent chronic TLR4 activation if lipid clearance half-life exceeded 24 hours.`;

    const assistantCitations = [
      {
        source_id: DEMO_SOURCE_1_ID,
        source_title: "Systematic Evaluation of Biodegradable Ester-Linked Ionizable Lipids for Hepatic mRNA Delivery",
        relevant_excerpt_or_claim: "Formulation LNP-EST4 achieved 14.2% endosomal escape efficiency (2.3x over benchmark MC3)."
      },
      {
        source_id: DEMO_SOURCE_2_ID,
        source_title: "Charge-Altering Branching Morphologies Drive Cytoplasmic Delivery at Lower N/P Ratios",
        relevant_excerpt_or_claim: "BTA-9 at N/P 3:1 reduced IL-6 < 12 pg/mL, but endosomal escape plateaued at 9.8%."
      },
      {
        source_id: DEMO_SOURCE_3_ID,
        source_title: "Persistent Toll-Like Receptor 4 Activation by Synthetic Lipid Headgroups in Repeat Dosing Regimens",
        relevant_excerpt_or_claim: "TLR4 activation occurred even at N/P 3.5 if lipid half-life was > 24 hours."
      }
    ];

    await query(
      `INSERT INTO chat_messages (id, workspace_id, user_id, role, content, citations, confidence_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        chatMsg2Id,
        DEMO_WORKSPACE_ID,
        DEMO_USER.id,
        'assistant',
        assistantAnswer,
        JSON.stringify(assistantCitations),
        'HIGH_CORPUS_SUPPORT',
      ]
    );

    console.log('✅ Demo account and rich research workspace seeded successfully.');
  } catch (error) {
    console.error('⚠️ Error seeding demo data:', error);
  }
}
