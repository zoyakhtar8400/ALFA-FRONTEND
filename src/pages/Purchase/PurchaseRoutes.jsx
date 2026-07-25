import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingState from '../../components/common/LoadingState';

const PurchaseDashboard = lazy(() => import('./PurchaseDashboard'));

// Master Sub-Modules
const ItemGroupList = lazy(() => import('./master/ItemGroup/ItemGroupList'));
const ItemMasterList = lazy(() => import('./master/ItemMaster/ItemMasterList'));
const OpenStockEntryList = lazy(() => import('./master/OpenStockEntry/OpenStockEntryList'));
const UnitMasterList = lazy(() => import('./master/UnitMaster/UnitMasterList'));
const CSVUploadList = lazy(() => import('./master/CSVUpload/CSVUploadList'));

// Operation Sub-Modules — Purchase Process
const IndentEntryList = lazy(() => import('./operation/IndentEntry/IndentEntryList'));
const IndentApprovalList = lazy(() => import('./operation/IndentApproval/IndentApprovalList'));
const QuotationEntryList = lazy(() => import('./operation/QuotationEntry/QuotationEntryList'));
const PurchaseOrderEntryList = lazy(() => import('./operation/PurchaseOrderEntry/PurchaseOrderEntryList'));
const GRNEntryList = lazy(() => import('./operation/GRNEntry/GRNEntryList'));
const PurchaseBillEntryList = lazy(() => import('./operation/PurchaseBillEntry/PurchaseBillEntryList'));
const PurchaseBillEntryDirectList = lazy(() => import('./operation/PurchaseBillEntryDirect/PurchaseBillEntryDirectList'));

// Operation Sub-Modules — Direct Process
const PurchaseReturnEntryList = lazy(() => import('./operation/PurchaseReturnEntry/PurchaseReturnEntryList'));
const DepartmentIssueList = lazy(() => import('./operation/DepartmentIssue/DepartmentIssueList'));
const StockTransferEntryList = lazy(() => import('./operation/StockTransferEntry/StockTransferEntryList'));
const ConsumerEntryList = lazy(() => import('./operation/ConsumerEntry/ConsumerEntryList'));

// Reports
const PurchaseReports = lazy(() => import('./reports/PurchaseReports'));

const PurchaseRoutes = ({ showToast }) => {
  return (
    <Suspense fallback={<LoadingState message="Loading Purchase workspace..." />}>
      <Routes>
        <Route path="/" element={<PurchaseDashboard showToast={showToast} />} />

        {/* Master Routes */}
        <Route path="/master/item-group" element={<ItemGroupList showToast={showToast} />} />
        <Route path="/master/item-master" element={<ItemMasterList showToast={showToast} />} />
        <Route path="/master/open-stock-entry" element={<OpenStockEntryList showToast={showToast} />} />
        <Route path="/master/unit-master" element={<UnitMasterList showToast={showToast} />} />
        <Route path="/master/item-entry-csv-upload" element={<CSVUploadList showToast={showToast} />} />

        {/* Operation Routes — Purchase Process */}
        <Route path="/operation/indent-entry" element={<IndentEntryList showToast={showToast} />} />
        <Route path="/operation/indent-approval" element={<IndentApprovalList showToast={showToast} />} />
        <Route path="/operation/quotation-entry" element={<QuotationEntryList showToast={showToast} />} />
        <Route path="/operation/purchase-order-entry" element={<PurchaseOrderEntryList showToast={showToast} />} />
        <Route path="/operation/grn-entry" element={<GRNEntryList showToast={showToast} />} />
        <Route path="/operation/purchase-bill-entry" element={<PurchaseBillEntryList showToast={showToast} />} />
        <Route path="/operation/purchase-bill-entry-direct" element={<PurchaseBillEntryDirectList showToast={showToast} />} />

        {/* Operation Routes — Direct Process */}
        <Route path="/operation/purchase-return-entry" element={<PurchaseReturnEntryList showToast={showToast} />} />
        <Route path="/operation/department-issue" element={<DepartmentIssueList showToast={showToast} />} />
        <Route path="/operation/stock-transfer-entry" element={<StockTransferEntryList showToast={showToast} />} />
        <Route path="/operation/consumer-entry" element={<ConsumerEntryList showToast={showToast} />} />

        {/* Reports */}
        <Route path="/reports" element={<PurchaseReports showToast={showToast} />} />
      </Routes>
    </Suspense>
  );
};

export default PurchaseRoutes;
