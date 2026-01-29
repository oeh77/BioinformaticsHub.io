/**
 * Affiliate Demo Data Seed Script
 * 
 * Run with: npx tsx prisma/seed-affiliate.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding affiliate demo data...\n');

  // Create demo partners
  const partners = await Promise.all([
    prisma.affiliatePartner.upsert({
      where: { slug: 'illumina' },
      update: {},
      create: {
        companyName: 'Illumina',
        slug: 'illumina',
        industryCategory: 'equipment',
        websiteUrl: 'https://www.illumina.com',
        description: 'Leading provider of DNA sequencing and array-based technologies',
        commissionRate: 8.0,
        commissionType: 'percentage',
        cookieDuration: 30,
        status: 'active',
        contactName: 'Partner Relations',
        contactEmail: 'partners@illumina.com',
      },
    }),
    prisma.affiliatePartner.upsert({
      where: { slug: 'thermo-fisher' },
      update: {},
      create: {
        companyName: 'Thermo Fisher Scientific',
        slug: 'thermo-fisher',
        industryCategory: 'reagents',
        websiteUrl: 'https://www.thermofisher.com',
        description: 'World leader in serving science with lab equipment, chemicals, and life science products',
        commissionRate: 6.0,
        commissionType: 'percentage',
        cookieDuration: 45,
        status: 'active',
        contactName: 'Affiliate Team',
        contactEmail: 'affiliates@thermofisher.com',
      },
    }),
    prisma.affiliatePartner.upsert({
      where: { slug: 'coursera' },
      update: {},
      create: {
        companyName: 'Coursera',
        slug: 'coursera',
        industryCategory: 'education',
        websiteUrl: 'https://www.coursera.org',
        description: 'Online learning platform offering courses from top universities',
        commissionRate: 15.0,
        commissionType: 'percentage',
        cookieDuration: 30,
        status: 'active',
        contactName: 'Coursera Partners',
        contactEmail: 'partners@coursera.org',
      },
    }),
    prisma.affiliatePartner.upsert({
      where: { slug: 'aws' },
      update: {},
      create: {
        companyName: 'Amazon Web Services',
        slug: 'aws',
        industryCategory: 'cloud',
        websiteUrl: 'https://aws.amazon.com',
        description: 'Cloud computing services for genomics and bioinformatics workloads',
        commissionRate: 5.0,
        commissionType: 'percentage',
        cookieDuration: 90,
        status: 'active',
        contactName: 'AWS Partner Network',
        contactEmail: 'partners@amazon.com',
      },
    }),
    prisma.affiliatePartner.upsert({
      where: { slug: 'qiagen' },
      update: {},
      create: {
        companyName: 'QIAGEN',
        slug: 'qiagen',
        industryCategory: 'reagents',
        websiteUrl: 'https://www.qiagen.com',
        description: 'Provider of sample and assay technologies for molecular diagnostics',
        commissionRate: 7.0,
        commissionType: 'percentage',
        cookieDuration: 30,
        status: 'active',
        contactName: 'QIAGEN Partners',
        contactEmail: 'partners@qiagen.com',
      },
    }),
    prisma.affiliatePartner.upsert({
      where: { slug: 'galaxy-project' },
      update: {},
      create: {
        companyName: 'Galaxy Project (UseGalaxy)',
        slug: 'galaxy-project',
        industryCategory: 'software',
        websiteUrl: 'https://usegalaxy.org',
        description: 'Open source, web-based platform for data intensive biomedical research',
        commissionRate: 10.0,
        commissionType: 'percentage',
        cookieDuration: 30,
        status: 'active',
      },
    }),
  ]);

  console.log(`✅ Created/Updated ${partners.length} partners\n`);

  // Create demo products
  const illumina = partners.find(p => p.slug === 'illumina');
  const thermofisher = partners.find(p => p.slug === 'thermo-fisher');
  const coursera = partners.find(p => p.slug === 'coursera');
  const aws = partners.find(p => p.slug === 'aws');

  const products = await Promise.all([
    // Illumina products
    prisma.affiliateProduct.upsert({
      where: { slug: 'novaseq-6000' },
      update: {},
      create: {
        partnerId: illumina!.id,
        productName: 'NovaSeq 6000 System',
        slug: 'novaseq-6000',
        productCategory: 'sequencer',
        subcategory: 'NGS',
        description: 'High-throughput sequencing system delivering the power, speed, and flexibility for virtually any project at any scale',
        price: 985000,
        pricingModel: 'one_time',
        productUrl: 'https://www.illumina.com/systems/sequencing-platforms/novaseq.html',
        affiliateUrl: 'https://www.illumina.com/systems/sequencing-platforms/novaseq.html?ref=bioinformaticshub',
        features: JSON.stringify([
          'Up to 6 Tb output',
          'Dual flow cells',
          'Flexible run options',
          'Scalable architecture'
        ]),
        tags: JSON.stringify(['NGS', 'sequencing', 'genomics', 'WGS']),
        isFeatured: true,
        status: 'active',
      },
    }),
    prisma.affiliateProduct.upsert({
      where: { slug: 'miseq-system' },
      update: {},
      create: {
        partnerId: illumina!.id,
        productName: 'MiSeq System',
        slug: 'miseq-system',
        productCategory: 'sequencer',
        subcategory: 'NGS',
        description: 'Integrated benchtop sequencer for targeted and small genome applications',
        price: 99000,
        pricingModel: 'one_time',
        productUrl: 'https://www.illumina.com/systems/sequencing-platforms/miseq.html',
        affiliateUrl: 'https://www.illumina.com/systems/sequencing-platforms/miseq.html?ref=bioinformaticshub',
        features: JSON.stringify([
          'Up to 15 Gb output',
          'Benchtop size',
          'Fast turnaround',
          'Simple workflow'
        ]),
        tags: JSON.stringify(['NGS', 'sequencing', 'targeted sequencing', 'amplicon']),
        status: 'active',
      },
    }),
    
    // Thermo Fisher products
    prisma.affiliateProduct.upsert({
      where: { slug: 'ion-torrent-genexus' },
      update: {},
      create: {
        partnerId: thermofisher!.id,
        productName: 'Ion Torrent Genexus System',
        slug: 'ion-torrent-genexus',
        productCategory: 'sequencer',
        subcategory: 'NGS',
        description: 'Fully automated NGS system from sample to results',
        price: 295000,
        pricingModel: 'one_time',
        productUrl: 'https://www.thermofisher.com/genexus',
        affiliateUrl: 'https://www.thermofisher.com/genexus?ref=bioinformaticshub',
        features: JSON.stringify([
          'Automated library prep',
          'Same-day results',
          'Onboard analysis',
          'Minimal hands-on time'
        ]),
        tags: JSON.stringify(['NGS', 'automation', 'clinical', 'oncology']),
        isFeatured: true,
        status: 'active',
      },
    }),
    
    // Coursera courses
    prisma.affiliateProduct.upsert({
      where: { slug: 'genomic-data-science-specialization' },
      update: {},
      create: {
        partnerId: coursera!.id,
        productName: 'Genomic Data Science Specialization',
        slug: 'genomic-data-science-specialization',
        productCategory: 'course',
        subcategory: 'Data Science',
        description: 'Master genomic data science. Learn to use the tools that are central to genomic data science',
        price: 49,
        pricingModel: 'subscription',
        productUrl: 'https://www.coursera.org/specializations/genomic-data-science',
        affiliateUrl: 'https://www.coursera.org/specializations/genomic-data-science?irclickid=bioinformaticshub',
        features: JSON.stringify([
          'Johns Hopkins University',
          '8 courses',
          'Python & R',
          'Certificate included'
        ]),
        tags: JSON.stringify(['education', 'genomics', 'data science', 'Python', 'R']),
        isFeatured: true,
        status: 'active',
      },
    }),
    prisma.affiliateProduct.upsert({
      where: { slug: 'bioinformatics-specialization' },
      update: {},
      create: {
        partnerId: coursera!.id,
        productName: 'Bioinformatics Specialization',
        slug: 'bioinformatics-specialization',
        productCategory: 'course',
        subcategory: 'Bioinformatics',
        description: 'Journey to the frontier of computational biology. Master bioinformatics software',
        price: 49,
        pricingModel: 'subscription',
        productUrl: 'https://www.coursera.org/specializations/bioinformatics',
        affiliateUrl: 'https://www.coursera.org/specializations/bioinformatics?irclickid=bioinformaticshub',
        features: JSON.stringify([
          'UC San Diego',
          '7 courses',
          'Algorithm design',
          'Hands-on projects'
        ]),
        tags: JSON.stringify(['education', 'bioinformatics', 'algorithms', 'Python']),
        status: 'active',
      },
    }),
    
    // AWS products
    prisma.affiliateProduct.upsert({
      where: { slug: 'aws-healthomics' },
      update: {},
      create: {
        partnerId: aws!.id,
        productName: 'Amazon HealthOmics',
        slug: 'aws-healthomics',
        productCategory: 'cloud',
        subcategory: 'Genomics Cloud',
        description: 'Purpose-built service for storing, querying, and analyzing genomic data at scale',
        pricingModel: 'usage_based',
        productUrl: 'https://aws.amazon.com/healthomics/',
        affiliateUrl: 'https://aws.amazon.com/healthomics/?ref=bioinformaticshub',
        features: JSON.stringify([
          'Managed storage',
          'Ready-to-run workflows',
          'Variant analysis',
          'Pay-per-use pricing'
        ]),
        tags: JSON.stringify(['cloud', 'genomics', 'AWS', 'storage', 'analysis']),
        isFeatured: true,
        status: 'active',
      },
    }),
  ]);

  console.log(`✅ Created/Updated ${products.length} products\n`);

  // Create sample disclosure
  await prisma.affiliateDisclosure.upsert({
    where: { id: 'default-disclosure' },
    update: {},
    create: {
      id: 'default-disclosure',
      disclosureType: 'banner',
      disclosureText: 'This article contains affiliate links. If you make a purchase through these links, we may earn a commission at no extra cost to you. Learn more in our affiliate disclosure.',
      position: 'top',
      isRequired: true,
      isDisplayed: true,
    },
  });

  console.log('✅ Created default disclosure\n');

  // Create sample campaign
  const blackFridayCampaign = await prisma.affiliateCampaign.upsert({
    where: { campaignCode: 'ngs-launch-2026' },
    update: {},
    create: {
      campaignName: 'NGS Product Launch 2026',
      campaignCode: 'ngs-launch-2026',
      campaignType: 'product_launch',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-03-31'),
      bonusCommissionRate: 2.0,
      description: 'New NGS products launch promotion with bonus commission',
      status: 'active',
    },
  });

  console.log(`✅ Created campaign: ${blackFridayCampaign.campaignName}\n`);

  console.log('🎉 Affiliate demo data seeded successfully!\n');
  console.log('Summary:');
  console.log(`  - ${partners.length} affiliate partners`);
  console.log(`  - ${products.length} affiliate products`);
  console.log(`  - 1 default disclosure`);
  console.log(`  - 1 active campaign\n`);
}

main()
  .catch((e) => {
    console.error('Error seeding affiliate data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
