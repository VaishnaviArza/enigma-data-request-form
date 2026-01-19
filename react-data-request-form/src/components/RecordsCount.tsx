import React from "react";
import { useSelector } from "react-redux";
import { Tooltip, OverlayTrigger, TooltipProps } from "react-bootstrap";
import { JSX } from "react/jsx-runtime";
import { RootState } from "../redux/store";
import { approximateRecordCountMessage } from "../constants";

const RecordCount = () => {
  const rowCount = useSelector((state: RootState) => state.metrics.rowCount);

  const renderTooltip = (
    props: JSX.IntrinsicAttributes &
      TooltipProps &
      React.RefAttributes<HTMLDivElement>
  ) => (
    <Tooltip id="button-tooltip" {...props}>
      {approximateRecordCountMessage}
    </Tooltip>
  );

  return (
    <div className="mt-3 d-flex">
      <span>
        Estimated count of records: <span>{rowCount}</span>
      </span>
      <OverlayTrigger placement="right" overlay={renderTooltip}>
        <div className="ml-1">
          <i className="fas fa-info-circle text-primary"></i>
        </div>
      </OverlayTrigger>
    </div>
  );
};

export default RecordCount;
