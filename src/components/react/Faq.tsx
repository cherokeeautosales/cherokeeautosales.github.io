import React from 'react';
import { Accordion } from 'react-bootstrap';

const FAQAccordion = () => {
  return (
    <Accordion
        style={{
            minHeight: '100%',
            height: '100%',
            backgroundColor: 'white',
            borderRadius: '10px',
        }}
    >
      <Accordion.Item eventKey="0">
       <Accordion.Button style={{margin: '0'}}>What is BHPH or Buy Here Pay Here financing?</Accordion.Button>
        <Accordion.Body>
          Experience hassle-free car financing with our Buy Here Pay Here (BHPH) option. Skip traditional lenders
          and make direct payments to us, unlocking a range of flexible financing solutions tailored to your needs.
          Discover the simplicity of BHPH financing as we guide you towards owning your dream vehicle.
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="1">
        <Accordion.Button style={{margin: '0'}}>How do I get a car today?</Accordion.Button>
        <Accordion.Body>
          First of all, you need to have a job that can be verified, and not be currently involved in a bankruptcy.
          You will need to present a state ID or Driver's License, a paystub, proof of residence, and your down payment.
          We value and respect your time, and with all these, you can drive away in about an hour. If you are not sure
          what does and does not qualify feel free to contact us, we are happy to answer any and all questions.
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="2">
        <Accordion.Button style={{margin: '0'}}>How much can I be approved for?</Accordion.Button>
        <Accordion.Body>
          Our calculations are based on your income and all other financial obligations you may have. With that
          information, we can determine a payment schedule that fits your particular circumstances. That may be weekly,
          bi-weekly or another plan. Remember, we want to help you any way we can. Unlike traditional car dealerships and
          banks, we will work with you to examine your current situation and not your past mistakes. So we can figure out
          a payment plan that works best for you!
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="3">
        <Accordion.Button style={{margin: '0'}}>How big a down payment do I need?</Accordion.Button>
        <Accordion.Body>
          That depends on the price of the car. A more significant down payment will always improve your chances of
          obtaining approval sooner. Not only that but with a larger down payment the car will be yours sooner. Which
          would also help your credit score improve. If you are not sure about how much of a down payment you will need
          or what you can afford based on your monthly payments, give us a call and we will help you.
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="4">
        <Accordion.Button style={{margin: '0'}}>Can I Take My Vehicle Home Today?</Accordion.Button>
        <Accordion.Body>
          YES! At Cherokee Auto you drive your chosen vehicle home the same day! We understand your eagerness to hit
          the road in your new car, and we're committed to providing a seamless and efficient process. In most cases,
          we can make it happen, ensuring you can start enjoying your vehicle right away.
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="5">
        <Accordion.Button style={{margin: '0'}}>Can you finance people even if they have bad credit?</Accordion.Button>
        <Accordion.Body>
          We believe in providing financing options for all applicants, regardless of their credit history. Our
          comprehensive in-house process carefully considers your complete application and required documentation,
          allowing us to tailor a decision that perfectly fits your specific needs.
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="6">
        <Accordion.Button style={{margin: '0'}}>Do you require a credit check to finance a vehicle?</Accordion.Button>
        <Accordion.Body>
          We understand that everyone's financial situation is unique. While we may consider factors such as credit
          history, our main focus is on your overall ability to make payments and your current financial stability. We
          believe in providing opportunities for individuals with various credit backgrounds, including those with
          less-than-perfect credit. Our goal is to find flexible financing solutions tailored to your specific needs, so
          you can drive away in the vehicle you desire. Visit us today and let us help you get on the road to car
          ownership, regardless of your credit history.
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="7">
        <Accordion.Button style={{margin: '0'}}>Will buying from CHEROKEE AUTO really help re-establish my credit?</Accordion.Button>
        <Accordion.Body>
          While it can seem like a never-ending cycle for people with no credit, poor credit or even bad credit, there
          is a way to improve your credit score. We can definitely help you establish or rebuild your credit as long as
          you meet your payment schedule.
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="8">
        <Accordion.Button style={{margin: '0'}}>Why choose Buy Here Pay Here financing over traditional lenders?</Accordion.Button>
        <Accordion.Body>
          We believe Buy Here Pay Here financing offers several advantages over traditional lenders. Firstly, we cater
          to individuals with challenging credit situations, including bad credit or no credit history. Instead of
          solely relying on credit scores, we assess your overall financial stability and focus on your ability to make
          payments. Secondly, our Buy Here Pay Here financing provides a hassle-free and straightforward process. You
          can complete the entire financing at our dealership, eliminating the complexities of dealing with external
          lenders. This seamless approach allows us to work directly with you and find a financing solution tailored to
          your unique needs. Experience the benefits of Buy Here Pay Here financing at Cherokee Auto Sales, where we are
          dedicated to helping you get behind the wheel of the car you deserve.
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="9">
        <Accordion.Button style={{margin: '0'}}>Is there a warranty included with every financed vehicle?</Accordion.Button>
        <Accordion.Body>
          Absolutely! We provide a 12 months / 12,000 miles Vehicle Service Contract with every vehicle we sell and
          finance. This Vehicle service contract offers you peace of mind and ensures that you are covered for any
          unexpected repairs or issues that may arise. For more information and specific details about our Vehicle
          service contract, please consult our knowledgeable sales representatives. They will be happy to assist you and
          provide you with all the necessary information you need to make an informed decision.
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="10">
        <Accordion.Button style={{margin: '0'}}>Cancellation or refund policy?</Accordion.Button>
        <Accordion.Body>
          If you have any questions on cancellation or refund contact 865-687-7100
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

export default FAQAccordion;
