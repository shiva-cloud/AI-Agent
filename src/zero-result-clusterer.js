// Zero-Result Query Clustering & Editorial Gaps Analyzer (Rec 10)
// Aggregates queries resulting in zero evidence or "missing_evidence" gaps,
// groups them by semantic/token overlap, and generates actionable reports for editors.

import { tokenize } from './search.js';
import { safeIsoDate } from './text-input.js';

export function clusterZeroResultQueries(queryLogs = [], options = {}) {
  const assessmentDate = safeIsoDate(options.assessmentDate, new Date().toISOString().slice(0, 10));
  if (!Array.isArray(queryLogs) || queryLogs.length === 0) {
    return {
      totalQueries: 0,
      uniqueClusters: 0,
      clusters: [],
      assessmentDate,
      reportGeneratedAt: assessmentDate
    };
  }

  const clusters = [];

  for (const log of queryLogs) {
    const rawQuery = typeof log === 'string' ? log : (log.question || log.query || '');
    if (!rawQuery.trim()) continue;

    const tokens = new Set(tokenize(rawQuery));
    if (tokens.size === 0) continue;

    // Find best matching cluster based on Jaccard token overlap
    let bestCluster = null;
    let highestJaccard = 0;

    for (const cluster of clusters) {
      let intersection = 0;
      for (const t of tokens) {
        if (cluster.tokenSet.has(t)) intersection++;
      }
      const union = tokens.size + cluster.tokenSet.size - intersection;
      const jaccard = union > 0 ? intersection / union : 0;

      if (jaccard > highestJaccard && jaccard >= 0.25) {
        highestJaccard = jaccard;
        bestCluster = cluster;
      }
    }

    if (bestCluster) {
      bestCluster.count++;
      bestCluster.queries.push(rawQuery);
      for (const t of tokens) bestCluster.tokenSet.add(t);
    } else {
      clusters.push({
        clusterId: `cluster-${clusters.length + 1}`,
        primaryTokens: [...tokens].slice(0, 3),
        tokenSet: tokens,
        count: 1,
        queries: [rawQuery]
      });
    }
  }

  // Sort clusters descending by frequency
  clusters.sort((a, b) => b.count - a.count);

  const formattedClusters = clusters.map(c => ({
    clusterId: c.clusterId,
    theme: c.primaryTokens.join(' + ') || 'general-settlement',
    frequency: c.count,
    sampleQueries: c.queries.slice(0, 5),
    recommendedAction: `Draft seed evidence or statutory rule for theme "${c.primaryTokens.join(' ')}"`
  }));

  return {
    totalQueries: queryLogs.length,
    uniqueClusters: formattedClusters.length,
    clusters: formattedClusters,
    assessmentDate,
    reportGeneratedAt: assessmentDate
  };
}

export function generateEditorialMarkdownReport(clusterReport) {
  let md = `# Zero-Result Query Cluster Report\n\n`;
  md += `*Generated: ${clusterReport.reportGeneratedAt}*\n`;
  md += `*Total Zero-Result Inquiries Analyzed: ${clusterReport.totalQueries}*\n`;
  md += `*Total Distinct Clusters Identified: ${clusterReport.uniqueClusters}*\n\n`;
  md += `## Top Missing Evidence Themes\n\n`;

  for (const c of clusterReport.clusters.slice(0, 10)) {
    md += `### ${c.theme.toUpperCase()} (${c.frequency} inquiries)\n`;
    md += `- **Action**: ${c.recommendedAction}\n`;
    md += `- **Sample Questions**:\n`;
    for (const sq of c.sampleQueries) {
      md += `  - "${sq}"\n`;
    }
    md += `\n`;
  }

  return md;
}
