import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@mui/material';
import './Dashboard.css'; // Custom CSS for styling
import LoadingIndicator from '../../common/components/LoadingIndicator';
import apiClient from '../../services/apiClientService';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isSameOrAfter);

const Dashboard = () => {
  const [cardDataMembers, setMembersCardData] = useState([]);
  const [cardDataGuests, setGuestsCardData] = useState([]);
  const [cardDataPayments, setPaymentCardData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getData = () => {
    setIsLoading(true);
    apiClient.get("/api/Users/GetAllWithDetailsActive").then((data) => {
      setIsLoading(false);
      getMemberCount(data);               
    }).catch((error) => {      
      setIsLoading(false);
      toast.error("Error while get " + error, {
        position: "top-right"
      });
    });
  };

  const getGuestData = () => {
    setIsLoading(true);
    apiClient.post("/api/Summary/GetGuestDetailedReportsAll", {}).then((data) => {
      setIsLoading(false);
      getGuestCount(data);
    }).catch((error) => {      
      setIsLoading(false);
      toast.error("Error while get " + error, {
        position: "top-right"
      });
    }); 
  }

  const getTotal = (data) => {
    const finalTotal = data.reduce((total, item) => {
      if (item.packagepaymentDetails && item.packagepaymentDetails.length > 0) {
        const memberTotalPayment = item.packagepaymentDetails.reduce((sum, payment) => {
          return sum + payment.roundedpayment;
        }, 0);              
        return total + memberTotalPayment;
      }
      return total;
    }, 0);
    return finalTotal;
  }

  const getMemberCount = (data) => {
    let members = data.filter(d=>d.usertype === "a4e1f874-9c36-41aa-8af4-f94615c6c363");
    const today = dayjs().startOf('day');

    const activeMembers = members.filter((item) => {
      if(item.packageDetails && item.packageDetails.length > 0) {
        return dayjs(item.packageDetails[0].actualenddate).isSameOrAfter(today, 'day');
      }
    });
    const expiredMembers = members.filter((item) => {
      if(item.packageDetails && item.packageDetails.length > 0) {
        return dayjs(item.packageDetails[0].actualenddate).isBefore(today, 'day');
      }
    });    

    const registeredToday = members.filter((item) => dayjs(item.registereddate).isSame(today, 'day'));

    const oneWeekAgo = today.subtract(7, 'days');
    const registeredInLastWeek = members.filter((item) => dayjs(item.registereddate).isAfter(oneWeekAgo, 'day'));

    const oneMonthAgo = today.subtract(1, 'month');
    const registeredInLastMonth = members.filter((item) => dayjs(item.registereddate).isAfter(oneMonthAgo, 'day'));

    const todaysPayment = getTotal(registeredToday);
    const weeksPayment = getTotal(registeredInLastWeek);
    const monthsPayment = getTotal(registeredInLastMonth);

    const totalPendingAmount = members.reduce((total, item) => {
      if (item.packagepaymentDetails && item.packagepaymentDetails.length > 0) {
        const memberTotalPayment = item.packagepaymentDetails.reduce((sum, payment) => {
          if(payment.paymentstatus === "Partial") {
            return sum + (payment.pendingamount && payment.pendingamount != null ? payment.pendingamount : 0);
          }
          return sum;      
        }, 0);              
        return total + memberTotalPayment;
      }
      return total;
    }, 0);

    const totalPendingMember = members.filter((item) => {
      if (item.packagepaymentDetails && item.packagepaymentDetails.length > 0) {
        return item.packagepaymentDetails.some(payment => payment.paymentstatus === "Partial");
      }
      return false;
    });

    let memberData = [];
    memberData.push({"title": "Total Members", "count": members.length});
    memberData.push({"title": "Active Members", "count": activeMembers.length});
    memberData.push({"title": "Expired Members", "count": expiredMembers.length});
    memberData.push({"title": "Registered Today", "count": registeredToday.length});
    memberData.push({ "title": "Today's Collection", "count": todaysPayment });
    memberData.push({ "title": "Current Week Collection", "count": weeksPayment });
    memberData.push({ "title": "Current Month Collection", "count": monthsPayment });
    memberData.push({ "title": "Total Pending Amount", "count": totalPendingAmount });
    memberData.push({ "title": "Pending Member", "count": totalPendingMember.length });
    setMembersCardData(memberData);
  }

  const getGuestCount = (guests) => {
    const today = dayjs().startOf('day');

    const registeredToday = guests.filter((item) => dayjs(item.registereddate).isSame(today, 'day'));

    const oneWeekAgo = today.subtract(7, 'days');
    const registeredInLastWeek = guests.filter((item) => dayjs(item.registereddate).isAfter(oneWeekAgo, 'day'));


    const oneMonthAgo = today.subtract(1, 'month');
    const registeredInLastMonth = guests.filter((item) => dayjs(item.registereddate).isAfter(oneMonthAgo, 'day'));

    const todaysPayment = registeredToday.reduce((sum, item) => sum + item.totalamount, 0);
    const weeksPayment = registeredInLastWeek.reduce((sum, item) => sum + item.totalamount, 0);
    const monthsPayment = registeredInLastMonth.reduce((sum, item) => sum + item.totalamount, 0);

    let guestData = [];
    guestData.push({ "title": "Total Guests", "count": guests.length });
    guestData.push({ "title": "Guests Today", "count": registeredToday.length });
    guestData.push({ "title": "Current Month Guests", "count": registeredInLastMonth.length });
    guestData.push({ "title": "Today's Collection", "count": todaysPayment });
    guestData.push({ "title": "Current Week Collection", "count": weeksPayment });
    guestData.push({ "title": "Current Month Collection", "count": monthsPayment });
    setGuestsCardData(guestData);
  }

  const getPaymentCount = () => {

    const filterDataForCount = (data, title) => {
      const filteredItem = data.find(item => item.title === title);
      return filteredItem ? filteredItem.count : 0;
    }

    const getTodaysCollection = filterDataForCount(cardDataMembers, "Today's Collection") + filterDataForCount(cardDataGuests, "Today's Collection");
    const getweekCollection = filterDataForCount(cardDataMembers, "Current Week Collection") + filterDataForCount(cardDataGuests, "Current Week Collection");
    const getmonthCollection = filterDataForCount(cardDataMembers, "Current Month Collection") + filterDataForCount(cardDataGuests, "Current Month Collection");
    setPaymentCardData([
      { "title": "Today's Collection", "count": getTodaysCollection },
      { "title": "Current Week Collection", "count": getweekCollection },
      { "title": "Current Month Collection", "count": getmonthCollection }]);
  }

  useEffect(() => {
    getPaymentCount();
  }, [cardDataGuests, cardDataMembers])

  useEffect(() => {
    getData();
    getGuestData();
  }, []);

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <h3>Members</h3>
      <div className="grid">
        {cardDataMembers.map((card, index) => (
          <Card key={index} className="dashboard-card">
            <CardContent className='card-content'>
              <span className="card-title">{card.title}</span>
              <div className="card-count" style={{ fontSize: String(card.count).length > 3 ? '20px' : '26px' }}>{card.count}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <h3>Guests</h3>
      <div className="grid">
        {cardDataGuests.map((card, index) => (
          <Card key={index} className="dashboard-card">
            <CardContent className='card-content'>
              <span className="card-title">{card.title}</span>
              <div className="card-count" style={{ fontSize: String(card.count).length > 3 ? '20px' : '26px' }}>{card.count}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <h3>Payments</h3>
      <div className="grid">
        {cardDataPayments.map((card, index) => (
          <Card key={index} className="dashboard-card">
            <CardContent className='card-content'>
              <span className="card-title">{card.title}</span>
              <div className="card-count" style={{ fontSize: String(card.count).length > 3 ? '20px' : '26px' }}>{card.count}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <LoadingIndicator isLoading={isLoading}/>
    </div>
  );
};

export default Dashboard;