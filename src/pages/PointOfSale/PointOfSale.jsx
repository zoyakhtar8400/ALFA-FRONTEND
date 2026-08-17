import React from 'react';
import { useLocation } from 'react-router-dom';
import StewardMasterPage from './Masters/StewardMaster/StewardMasterPage';
import AreaMasterPage from './Masters/AreaMaster/AreaMasterPage';
import PaymentMasterPage from './Masters/PaymentMaster/PaymentMasterPage';
import DeliveryMasterPage from './Masters/DeliveryMaster/DeliveryMasterPage';
import OutletMasterPage from './Masters/OutletMaster/OutletMasterPage';
import TableMasterPage from './Masters/TableMaster/TableMasterPage';
import TableStructurePage from './Masters/TableStructure/TableStructurePage';
import ItemTaxCategoryPage from './Masters/ItemTaxCategory/ItemTaxCategoryPage';
import MainGroupPage from './Masters/ItemMenu/MainGroupEntry/MainGroupPage';
import ItemGroupPage from './Masters/ItemMenu/ItemGroupEntry/ItemGroupPage';
import MenuItemPage from './Masters/ItemMenu/MenuItemEntry/MenuItemPage';
import ItemEnterPage from './Masters/ItemMenu/ItemEnter/ItemEnterPage';
import HSNCodeEntryPage from './Masters/ItemMenu/HSNCodeEntry/HSNCodeEntryPage';
import NCTypeMasterPage from './Masters/NCTypeMaster/NCTypeMasterPage';
import ItemRateUpdatePage from './Masters/ItemRateUpdate/ItemRateUpdatePage';
import ItemRateCategoryPage from './Masters/ItemRateCategory/ItemRateCategoryPage';
import ReportsRouter from './reports/ReportsRouter';


const PointOfSale = ({ showToast }) => {
  const location = useLocation();
  const path = location.pathname;

  const renderSubPage = () => {
    if (path.includes('/report')) {
      return <ReportsRouter showToast={showToast} />;
    }
    if (path.includes('/masters/steward-master') || path.includes('/master/steward-master')) {
      return <StewardMasterPage showToast={showToast} />;
    }
    if (path.includes('/master/area') || path.includes('/masters/area')) {
      return <AreaMasterPage showToast={showToast} />;
    }
    if (path.includes('/master/payment') || path.includes('/masters/payment')) {
      return <PaymentMasterPage showToast={showToast} />;
    }
    if (path.includes('/master/delivery')) {
      return <DeliveryMasterPage showToast={showToast} />;
    }
    if (path.includes('/master/outlet') && !/\/master\/outlet\/\d+/.test(path)) {
      return <OutletMasterPage showToast={showToast} />;
    }
    if (path.includes('/master/table') && !path.includes('/master/table-structure')) {
      return <TableMasterPage showToast={showToast} />;
    }
    if (path.includes('/master/structure-design') || path.includes('/master/table-structure')) {
      return <TableStructurePage showToast={showToast} />;
    }
    if (path.includes('/master/tax-category')) {
      return <ItemTaxCategoryPage showToast={showToast} />;
    }
    if (path.includes('/master/item-menu/main-group')) {
      return <MainGroupPage showToast={showToast} />;
    }
    if (path.includes('/master/item-menu/item-group')) {
      return <ItemGroupPage showToast={showToast} />;
    }
    if (path.includes('/master/item-menu/menu-item')) {
      return <MenuItemPage showToast={showToast} />;
    }
    if (path.includes('/master/item-menu/csv-upload')) {
      return <ItemEnterPage showToast={showToast} />;
    }
    if (path.includes('/master/item-menu/hsn-update')) {
      return <HSNCodeEntryPage showToast={showToast} />;
    }
    if (path.includes('/master/nc-type')) {
      return <NCTypeMasterPage showToast={showToast} />;
    }
    if (path.includes('/master/rate-update')) {
      return <ItemRateUpdatePage showToast={showToast} />;
    }
    if (path.includes('/master/rate-category')) {
      return <ItemRateCategoryPage showToast={showToast} />;
    }
    return (
      <div className="dashboard-panel" style={{ padding: '24px' }}>
        <div className="panel-header">
          <h2 className="panel-title">Point Of Sale (POS)</h2>
        </div>
        <p className="text-secondary">Process billing and orders for retail and hotel outlets.</p>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100%' }}>
      {renderSubPage()}
    </div>
  );
};

export default PointOfSale;
