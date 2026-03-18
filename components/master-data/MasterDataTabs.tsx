"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import CompanyProfileForm from "@/components/master-data/CompanyProfileForm";
import HomeContentForm from "@/components/master-data/HomeContentForm";

export default function MasterDataTabs() {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={(_e, value: number) => setTab(value)}
        sx={{ mb: 3 }}
      >
        <Tab label="ข้อมูลบริษัท" />
        <Tab label="บริการของเรา" />
      </Tabs>

      {tab === 0 && <CompanyProfileForm />}
      {tab === 1 && <HomeContentForm />}
    </Box>
  );
}
