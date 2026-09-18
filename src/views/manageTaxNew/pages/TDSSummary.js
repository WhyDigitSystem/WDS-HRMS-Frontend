import React, { useState, useEffect, useMemo } from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import apiCalls from "apicall";

const TDSsummary = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const branch = localStorage.getItem("branch");
  const employeeCode = localStorage.getItem("employeeCode");
  const orgId = localStorage.getItem("orgId");

  const year = new Date().getFullYear();

  const currentMonth = new Date().toLocaleString("en-US", {
    month: "long",
  });

  const getAllData = async () => {
    try {
      setLoading(true);

      const res = await apiCalls(
        "get",
        `investmentDeclaration/getTdsSummaryDetails?branch=${branch}&employeeCode=${employeeCode}&orgId=${orgId}`
      );

      if (res?.status === true) {
        setData(res?.paramObjectsMap?.dashBoardDetails || []);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("TDS Summary Error:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllData();
  }, [branch, employeeCode, orgId]);

  const months = useMemo(() => {
    return Array.isArray(data)
      ? data.map((item) => ({
          month: item?.month?.slice(0, 3) || "",
          amount: Number(item?.monthlyTdasAmount || 0),
          active: item?.month === currentMonth,
        }))
      : [];
  }, [data, currentMonth]);

  const totalTDS = useMemo(() => {
    return data.reduce(
      (sum, item) => sum + Number(item?.monthlyTdasAmount || 0),
      0
    );
  }, [data]);

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        p: 3,
      }}
    >
      <Typography
        sx={{
          fontSize: "1.125rem",
          fontWeight: 600,
          color: "#0f172a",
          mb: 2,
        }}
      >
        Monthly TDS Deduction (FY {year})
      </Typography>

      {loading ? (
        <Typography
          sx={{
            textAlign: "center",
            color: "#64748b",
            py: 4,
          }}
        >
          Loading...
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {months.length > 0 ? (
            months.map((item, index) => (
              <Grid item xs={6} sm={4} md={2} key={index}>
                <Box
                  sx={{
                    border: item.active
                      ? "1px solid #bfdbfe"
                      : "1px solid #e2e8f0",
                    backgroundColor: item.active
                      ? "#eff6ff"
                      : "#f8fafc",
                    borderRadius: "12px",
                    py: 2.5,
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: item.active ? "#2563eb" : "#64748b",
                      mb: 1,
                    }}
                  >
                    {item.month}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: item.active ? "#2563eb" : "#334155",
                    }}
                  >
                    ₹{item.amount.toLocaleString("en-IN")}
                  </Typography>
                </Box>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography
                sx={{
                  textAlign: "center",
                  color: "#64748b",
                  py: 3,
                }}
              >
                No TDS data available
              </Typography>
            </Grid>
          )}
        </Grid>
      )}

      <Typography
        sx={{
          mt: 3,
          fontSize: "0.85rem",
          color: "#64748b",
        }}
      >
        Total TDS deducted till date:{" "}
        <Box
          component="span"
          sx={{
            fontWeight: 700,
            color: "#475569",
          }}
        >
          ₹{totalTDS.toLocaleString("en-IN")}
        </Box>
      </Typography>
    </Paper>
  );
};

export default TDSsummary;