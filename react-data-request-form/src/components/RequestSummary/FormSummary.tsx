import React, {useEffect, useState} from "react";
import { Container, Row, Col, Card, Spinner, Form, Badge } from "react-bootstrap";
import { DataRequestIn, MetricEntry } from "../../types/DataRequest";
import { styled } from "styled-components";
import ApiUtils from "../../api/ApiUtils";
import { getCurrentUserToken } from "../../services/authService";

interface FormSummaryProps {
  data: DataRequestIn | undefined;
  isLoading: boolean;
}

const FormSummary: React.FC<FormSummaryProps> = ({ data, isLoading }) => {
  const [sessionStats, setSessionStats] = useState<{
    count: number;
    total_sites: number;
    sessions_per_site: { [site: string]: number };
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [cohortPIMap, setCohortPIMap] = useState<{ 
    [cohort: string]: Array<{ name: string; role: string }> 
  }>({});
  const StyledCard = styled(Card)`
    margin-bottom: 1rem;
    border: 1px solid #e0e0e0;
  `;

  const StyledCardHeader = styled(Card.Header)`
    padding: 0.75rem 1rem;
    background-color: #f8f9fa;
    font-weight: 600;
  `;

  const StyledCardBody = styled(Card.Body)`
    padding: 1rem;
  `;

  const MetricItem = styled.div`
    padding: 0.25rem 0;
    font-size: 0.95rem;
  `;
  // ⭐ ADD THIS - Fetch PI mapping on mount
  useEffect(() => {
    const fetchPIs = async () => {
      try {
        const token = await getCurrentUserToken();
        const piMap = await ApiUtils.fetchPIsByCohort(token);
        setCohortPIMap(piMap);
      } catch (error) {
        console.error("Error fetching PI mapping:", error);
      }
    };
    
    fetchPIs();
  }, []);
  // Calculate session stats when data loads
  useEffect(() => {
    const calculateStats = async () => {
      if (!data || !data.data) return;

      try {
        setStatsLoading(true);
        
        // Build the filters payload from the request data
        const filters = {
          timepoint: data.data.timepoint || "baseline",
          required_metrics: [
            ...(data.data.behavior?.required?.map((m: MetricEntry) => m.metric_name) || []),
            ...(data.data.imaging?.required?.map((m: MetricEntry) => m.metric_name) || []),
          ],
          or_groups: data.data.or_groups?.map((group: any) => 
            group.metrics.map((m: MetricEntry) => m.metric_name)
          ) || [],
        };

        // Call the API to get row count and site stats
        const response = await ApiUtils.getRowCount(filters);
        setSessionStats({
          count: response.count,
          total_sites: response.total_sites,
          sessions_per_site: response.sessions_per_site,
        });
      } catch (error) {
        console.error("Error calculating session stats:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    calculateStats();
  }, [data]);
  if (isLoading) {
    return (
      <Container className="text-center">
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (!data) {
    return <div>No data to display.</div>;
  }

  const { behavior, imaging, or_groups, timepoint, notes } = data.data;

  // Combine all required metrics from both behavior and imaging
  const allRequiredMetrics = [
    ...(behavior.required || []),
    ...(imaging.required || []),
  ];

  // Combine all optional metrics from both behavior and imaging
  const allOptionalMetrics = [
    ...(behavior.optional || []),
    ...(imaging.optional || []),
  ];

  const renderMetricText = (metric: MetricEntry) => {
    let displayText = metric.metric_name || metric.display_name;
    
    // Add filter values if present
    if (metric.value1 || metric.value2) {
      if (metric.type === "int" || metric.type === "float") {
        if (metric.value1 && metric.value2) {
          displayText += ` (${metric.value1} - ${metric.value2})`;
        } else if (metric.value1) {
          displayText += ` (> ${metric.value1})`;
        } else if (metric.value2) {
          displayText += ` (< ${metric.value2})`;
        }
      } else if (metric.type === "string" && metric.value1) {
        displayText += ` (= ${metric.value1})`;
      }
    }

    return (
      <MetricItem
        key={`${metric.metric_name}-${metric.category}`} 
      >
        {displayText}
      </MetricItem>
    );
  };

  const renderOrGroups = () => (
    or_groups &&
    or_groups.length > 0 && (
      <StyledCard>
        <StyledCardHeader>
          OR Groups
        </StyledCardHeader>
        <StyledCardBody>
          {or_groups.map((group) => (
            <div key={group.group_id} className="mb-3">
              <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
                Group {group.group_id}:
              </div>
              <div>
                {group.metrics.map((m) => (
                  <MetricItem key={`${m.metric_name}-${group.group_id}`}>
                    {m.metric_name || m.display_name}
                  </MetricItem>
                ))}
              </div>
            </div>
          ))}
        </StyledCardBody>
      </StyledCard>
    )
  );

  // Calculate row count (this would come from the data summary)
  // For now, we'll add a placeholder - you'll need to pass this from dataSummary
  //const rowCount = data.data.row_count || "N/A";

  return (
    <Container>
      <h2 className="mt-3 mb-4" style={{ fontWeight: 700 }}>
        Form Summary
      </h2>

      {/* Required Metrics */}
      {allRequiredMetrics.length > 0 && (
        <StyledCard>
          <StyledCardHeader>
            Required Metrics
          </StyledCardHeader>
          <StyledCardBody>
            {allRequiredMetrics.map((metric) => renderMetricText(metric))}
          </StyledCardBody>
        </StyledCard>
      )}

      {/* Optional Metrics */}
      {allOptionalMetrics.length > 0 && (
        <StyledCard>
          <StyledCardHeader>
            Optional Metrics
          </StyledCardHeader>
          <StyledCardBody>
            {allOptionalMetrics.map((metric) => renderMetricText(metric))}
          </StyledCardBody>
        </StyledCard>
      )}

      {/* OR Groups */}
      {renderOrGroups()}
      {/* Session Statistics */}
      <Row className="mb-3">
        <Col md={6}>
          <StyledCard>
            <StyledCardBody>
              <strong>Number of session_ids:</strong>{" "}
              {statsLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                sessionStats?.count ?? "N/A"
              )}
            </StyledCardBody>
          </StyledCard>
        </Col>
        <Col md={6}>
          <StyledCard>
            <StyledCardBody>
              <strong>Number of sites:</strong>{" "}
              {statsLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                sessionStats?.total_sites ?? "N/A"
              )}
            </StyledCardBody>
          </StyledCard>
        </Col>
      </Row>

      {/* Site Breakdown */}
      {sessionStats && sessionStats.sessions_per_site && Object.keys(sessionStats.sessions_per_site).length > 0 && (
        <StyledCard className="mb-3">
          <StyledCardHeader>Session_ids per Site</StyledCardHeader>
          <StyledCardBody>
            <div style={{ fontSize: '0.9rem' }}>
              {Object.entries(sessionStats.sessions_per_site)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([site, count]) => {
                  // ⭐ Get PI names for this site
                  const piList = cohortPIMap[site] || [];
                  const piDisplay = piList.length > 0 
                    ? ` (${piList.map(p => `${p.name} - ${p.role}`).join(", ")})` 
                    : "";
                  
                  return (
                    <div 
                      key={site} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        padding: '0.5rem 0',
                        borderBottom: '1px solid #f0f0f0',
                        alignItems: 'center'
                      }}
                    >
                      <span>
                        {site}
                        <span style={{ color: '#666', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                          {piDisplay}
                        </span>
                      </span>
                      <span style={{ fontWeight: 500 }}>{count}</span>
                    </div>
                  );
                })}
            </div>
          </StyledCardBody>
        </StyledCard>
      )}

      {/* Secondary Proposal Status */}
      <StyledCard>
        <StyledCardHeader>Secondary Proposal Status</StyledCardHeader>
        <StyledCardBody>
          {data.data.proposal_status ? (
            <p className="mb-0">{data.data.proposal_status}</p>
          ) : (
            <p className="text-muted mb-0">No status provided.</p>
          )}
        </StyledCardBody>
      </StyledCard>

      {/* Notes */}
      {notes && (
        <StyledCard>
          <StyledCardHeader>Notes</StyledCardHeader>
          <StyledCardBody>
            <Form.Control
              as="textarea"
              rows={4}
              value={notes}
              disabled
              style={{ backgroundColor: 'white', border: 'none' }}
            />
          </StyledCardBody>
        </StyledCard>
      )}
    </Container>
  );
};

export default FormSummary;