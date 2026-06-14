import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } | Promise<{ symbol: string }> }
) {
  // Await params if it's a promise (Next.js 15 pattern)
  const resolvedParams = await params;
  const symbol = resolvedParams.symbol;

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 });
  }

  try {
    // Query UniProt for human protein matching the exact gene symbol, ensuring it is a reviewed (Swiss-Prot) entry
    const uniprotUrl = `https://rest.uniprot.org/uniprotkb/search?query=(gene_exact:${symbol})+AND+(organism_id:9606)+AND+(reviewed:true)&fields=accession,id,protein_name,gene_names,cc_function&size=1`;
    
    const response = await fetch(uniprotUrl);
    
    if (!response.ok) {
      throw new Error(`UniProt API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return NextResponse.json({ error: 'No matching protein found' }, { status: 404 });
    }

    const result = data.results[0];
    
    // Extract description/function
    let functionDescription = null;
    if (result.comments) {
      const functionComment = result.comments.find((c: { commentType: string; texts?: { value: string }[] }) => c.commentType === 'FUNCTION');
      if (functionComment && functionComment.texts && functionComment.texts.length > 0) {
        functionDescription = functionComment.texts[0].value;
      }
    }

    // Extract aliases
    let aliases: string[] = [];
    if (result.genes && result.genes.length > 0) {
      const gene = result.genes[0];
      if (gene.synonyms) {
        aliases = gene.synonyms.map((s: { value: string }) => s.value);
      }
    }

    const proteinName = result.proteinDescription?.recommendedName?.fullName?.value || 
                       result.proteinDescription?.submissionNames?.[0]?.fullName?.value || 
                       'Unknown Protein';

    let openTargetsData = null;
    try {
      // 1. Search for the target Ensembl ID by symbol
      const otSearchQuery = `
        query searchTarget($queryString: String!) {
          search(queryString: $queryString, entityNames: ["target"], page: {index: 0, size: 1}) {
            hits {
              id
            }
          }
        }
      `;
      const searchRes = await fetch("https://api.platform.opentargets.org/api/v4/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: otSearchQuery,
          variables: { queryString: symbol }
        })
      });
      const searchJson = await searchRes.json();
      const targetId = searchJson.data?.search?.hits?.[0]?.id;

      if (targetId) {
        // 2. Fetch associated diseases
        const otDiseaseQuery = `
          query targetDiseases($ensemblId: String!) {
            target(ensemblId: $ensemblId) {
              id
              approvedSymbol
              associatedDiseases(page: {index: 0, size: 5}) {
                rows {
                  disease {
                    id
                    name
                  }
                  score
                }
              }
            }
          }
        `;
        const diseaseRes = await fetch("https://api.platform.opentargets.org/api/v4/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: otDiseaseQuery,
            variables: { ensemblId: targetId }
          })
        });
        const diseaseJson = await diseaseRes.json();
        
        const diseases = diseaseJson.data?.target?.associatedDiseases?.rows?.map((row: { disease: { id: string; name: string }; score: number }) => ({
          name: row.disease.name,
          score: row.score
        })) || [];

        openTargetsData = {
          ensemblId: targetId,
          diseases
        };
      }
    } catch (otError) {
      console.error("OpenTargets fetch error:", otError);
      // Don't fail the whole request if OT fails
    }

    return NextResponse.json({
      accession: result.primaryAccession,
      proteinName: proteinName,
      aliases: aliases,
      functionDescription: functionDescription,
      openTargets: openTargetsData,
      source: 'UniProtKB & OpenTargets'
    });

  } catch (error) {
    console.error('Error fetching live gene data:', error);
    return NextResponse.json({ error: 'Failed to fetch live gene data' }, { status: 500 });
  }
}
