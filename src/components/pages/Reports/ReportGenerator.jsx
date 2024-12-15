import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx'; // Import the XLSX library for Excel export
import './ReportGenerator.css';

const ReportGenerator = () => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [displayDialog, setDisplayDialog] = useState(false);

  const [activeMembers, setActiveMembers] = useState([]);
  const [expiredMembers, setExpiredMembers] = useState([]);
  const [guestDetails, setGuestDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const timePeriodOptions = [
    { label: 'All', value: 'all' },
    { label: 'Month', value: 'monthly' },
    { label: 'Last 3 Months', value: 'current_quarter_month' },
    { label: 'Last 6 Months', value: 'last_half_year' },
    { label: 'Last 1 Year', value: 'last_1_year' }
  ];

  const orderOptions = [
    { label: 'Amount High to Low', value: 'amount_high_to_low' },
    { label: 'Amount Low to High', value: 'amount_low_to_low' },
    { label: 'Registration Date Low to High', value: 'reg_date_low_to_high' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/reportsMembers.json'); // Update path here
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setActiveMembers(data.activeMembers);
        setExpiredMembers(data.expiredMembers);
        setGuestDetails(data.guestDetails);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const generateReport = () => {
    setDisplayDialog(true);
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.text('Report', 14, 16);

    autoTable(doc, {
      head: [['Name', 'Contact', 'Package', 'Amount Paid', 'Amount Remaining', 'Duration']],
      body: activeMembers.map(member => [member.name, member.contact, member.package, member.amountPaid, member.amountRemaining, member.duration]),
      startY: 30,
    });

    autoTable(doc, {
      head: [['Name', 'Contact', 'Package', 'Amount Paid', 'Amount Remaining', 'Duration']],
      body: expiredMembers.map(member => [member.name, member.contact, member.package, member.amountPaid, member.amountRemaining, member.duration]),
      startY: doc.autoTable.previous.finalY + 10,
    });

    autoTable(doc, {
      head: [['Name', 'Contact', 'Package', 'Amount Paid', 'Amount Remaining', 'Duration']],
      body: guestDetails.map(guest => [guest.name, guest.contact, guest.package, guest.amountPaid, guest.amountRemaining, guest.duration]),
      startY: doc.autoTable.previous.finalY + 10,
    });

    doc.save('report.pdf');
  };

  const exportExcel = () => {
    const membersData = [
      ...activeMembers.map(member => ({
        Name: member.name,
        Contact: member.contact,
        Package: member.package,
        AmountPaid: member.amountPaid,
        AmountRemaining: member.amountRemaining,
        Duration: member.duration,
      })),
      ...expiredMembers.map(member => ({
        Name: member.name,
        Contact: member.contact,
        Package: member.package,
        AmountPaid: member.amountPaid,
        AmountRemaining: member.amountRemaining,
        Duration: member.duration,
      })),
      ...guestDetails.map(guest => ({
        Name: guest.name,
        Contact: guest.contact,
        Package: guest.package,
        AmountPaid: guest.amountPaid,
        AmountRemaining: guest.amountRemaining,
        Duration: guest.duration,
      })),
    ];

    const worksheet = XLSX.utils.json_to_sheet(membersData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Members and Guests');

    XLSX.writeFile(workbook, 'report.xlsx');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <></>
    // <div className="report-generator-unique">
    //   <h2 className="report-header-unique">Reports - Members & Guests</h2>

    //   {/* Top Section */}
    //   <div className="p-panel p-my-2">
    //     <div className="p-grid p-align-center p-justify-between">
    //       <div className="p-col-2">
    //         <Dropdown
    //           value={selectedTimePeriod}
    //           options={timePeriodOptions}
    //           onChange={(e) => setSelectedTimePeriod(e.value)}
    //           placeholder="Select Time Period"
    //         />
    //       </div>
    //       <div className="p-col-3">
    //         {selectedTimePeriod && (
    //           <Calendar
    //             id="fromDate"
    //             value={fromDate}
    //             onChange={(e) => setFromDate(e.value)}
    //             showIcon
    //             placeholder="From Date"
    //           />
    //         )}
    //       </div>
    //       <div className="p-col-3">
    //         {selectedTimePeriod && (
    //           <Calendar
    //             id="toDate"
    //             value={toDate}
    //             onChange={(e) => setToDate(e.value)}
    //             showIcon
    //             placeholder="To Date"
    //           />
    //         )}
    //       </div>
    //       <div className="p-col-2">
    //         <Dropdown
    //           value={selectedOrder}
    //           options={orderOptions}
    //           onChange={(e) => setSelectedOrder(e.value)}
    //           placeholder="Order By"
    //         />
    //       </div>
    //     </div>
    //     <div className="p-my-2">
    //       <Button label="Generate Report" icon="pi pi-file" onClick={generateReport} style={{ marginLeft: '71%' }} />
    //     </div>
    //   </div>

    //   {/* Dialog for Report */}
    //   <Dialog header="Generated Report" visible={displayDialog} onHide={() => setDisplayDialog(false)} style={{ width: '70vw' }}>
    //     <div className="p-grid">
    //       {/* Active Members Card */}
    //       <div className="p-col-12 p-md-4">
    //         <div style={{ padding: '10px', margin: '10px 0', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', borderRadius: '5px' }}>
    //           <h4>Active Members</h4>
    //           <table className="p-table">
    //             <thead>
    //               <tr>
    //                 <th>Name</th>
    //                 <th>Contact</th>
    //                 <th>Package</th>
    //                 <th>Amount Paid</th>
    //                 <th>Amount Remaining</th>
    //                 <th>Duration</th>
    //               </tr>
    //             </thead>
    //             <tbody>
    //               {activeMembers.map((member, index) => (
    //                 <tr key={index}>
    //                   <td>{member.name}</td>
    //                   <td>{member.contact}</td>
    //                   <td>{member.package}</td>
    //                   <td>{member.amountPaid}</td>
    //                   <td>{member.amountRemaining}</td>
    //                   <td>{member.duration}</td>
    //                 </tr>
    //               ))}
    //             </tbody>
    //           </table>
    //         </div>
    //       </div>

    //       {/* Expired Members Card */}
    //       <div className="p-col-12 p-md-4">
    //         <div style={{ padding: '10px', margin: '10px 0', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', borderRadius: '5px' }}>
    //           <h4>Expired Members</h4>
    //           <table className="p-table">
    //             <thead>
    //               <tr>
    //                 <th>Name</th>
    //                 <th>Contact</th>
    //                 <th>Package</th>
    //                 <th>Amount Paid</th>
    //                 <th>Amount Remaining</th>
    //                 <th>Duration</th>
    //               </tr>
    //             </thead>
    //             <tbody>
    //               {expiredMembers.map((member, index) => (
    //                 <tr key={index}>
    //                   <td>{member.name}</td>
    //                   <td>{member.contact}</td>
    //                   <td>{member.package}</td>
    //                   <td>{member.amountPaid}</td>
    //                   <td>{member.amountRemaining}</td>
    //                   <td>{member.duration}</td>
    //                 </tr>
    //               ))}
    //             </tbody>
    //           </table>
    //         </div>
    //       </div>

    //       {/* Guests Card */}
    //       <div className="p-col-12 p-md-4">
    //         <div style={{ padding: '10px', margin: '10px 0', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', borderRadius: '5px' }}>
    //           <h4>Guests</h4>
    //           <table className="p-table">
    //             <thead>
    //               <tr>
    //                 <th>Name</th>
    //                 <th>Contact</th>
    //                 <th>Package</th>
    //                 <th>Amount Paid</th>
    //                 <th>Amount Remaining</th>
    //                 <th>Duration</th>
    //               </tr>
    //             </thead>
    //             <tbody>
    //               {guestDetails.map((guest, index) => (
    //                 <tr key={index}>
    //                   <td>{guest.name}</td>
    //                   <td>{guest.contact}</td>
    //                   <td>{guest.package}</td>
    //                   <td>{guest.amountPaid}</td>
    //                   <td>{guest.amountRemaining}</td>
    //                   <td>{guest.duration}</td>
    //                 </tr>
    //               ))}
    //             </tbody>
    //           </table>
    //         </div>
    //       </div>
    //     </div>

    //     <div className="p-dialog-footer">
    //       <Button label="Export to PDF" icon="pi pi-file-pdf" onClick={exportPdf} className="p-button-secondary" />
    //       <Button label="Export to Excel" icon="pi pi-file-excel" onClick={exportExcel} className="p-button-secondary" />
    //     </div>
    //   </Dialog>
    // </div>
  );
};

export default ReportGenerator;