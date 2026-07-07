import React from 'react';
import Booking from './booking/Booking';
import WalkinCheckin from './walkinCheckin/WalkinCheckin';
import PaymentReceive from './paymentReceive/PaymentReceive';
import ServiceChargeEntry from './serviceCharge/ServiceChargeEntry';
import RoomChangeEntry from './roomChange/RoomChangeEntry';
import RoomCheckoutEntry from './roomCheckout/RoomCheckoutEntry';
import CheckoutEntry from './checkout/CheckoutEntry';
import RefundEntry from './refund/RefundEntry';
import AddGuest from './addGuest/AddGuest';
import NightAudit from './nightAudit/NightAudit';
import GuestProfile from './guestProfile/GuestProfile';
import MultiRoomCheckout from './multiRoomCheckout/MultiRoomCheckout';
import RoomEnquiry from './roomEnquiry/RoomEnquiry';
import ExpenseEntry from './expenseEntry/ExpenseEntry';
import AmendStayEntry from './amendStay/AmendStayEntry';

const OperationPage = ({ operationName, showToast }) => {
  const components = {
    'Booking': Booking,
    'Walkin Checkin Entry': WalkinCheckin,
    'Payment Recieve Entry': PaymentReceive,
    'Service Charge Entry': ServiceChargeEntry,
    'Room Change Entry': RoomChangeEntry,
    'Room Checkout Entry': RoomCheckoutEntry,
    'Checkout Entry': CheckoutEntry,
    'Refund Entry': RefundEntry,
    'Add Guest in Room Entry': AddGuest,
    'Add Guest In Room Entry': AddGuest,
    'Night Audit Entry': NightAudit,
    'Guest Profile': GuestProfile,
    'Multi Room Checkout': MultiRoomCheckout,
    'Room Enquiry Entry': RoomEnquiry,
    'Expense Entry': ExpenseEntry,
    'Amend Stay Entry': AmendStayEntry,
  };

  const Component = components[operationName];

  if (!Component) {
    return (
      <div className="dashboard-panel">
        <div className="panel-header">
          <h3 className="panel-title">{operationName}</h3>
        </div>
        <p className="text-secondary">Operation form for {operationName} is coming soon.</p>
      </div>
    );
  }

  return <Component showToast={showToast} />;
};

export default OperationPage;
