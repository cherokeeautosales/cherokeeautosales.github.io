import React from 'react';
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';

function NavBar(props: {}) {
    return (
		<Navbar expand="lg" className="navbar main-bar">
		<Container>
			<Navbar.Brand href="/#home">
				<img
					src="/images/logo.png"
					width="30"
					height="30"
					className="d-inline-block align-top"
					alt="Cherokee Auto Sales"
				/>
				Cherokee Auto Sales
			</Navbar.Brand>
			<Navbar.Toggle aria-controls="basic-navbar-nav" />
			<Navbar.Collapse
				id="basic-navbar-nav"
			>
				<Nav
					className="me-auto justify-content-end w-100 text-white align-items-lg-center"
				>
					<Nav.Link href="/#home">Home</Nav.Link>
					<Nav.Link href="/#testimonials">Testimonials</Nav.Link>
					<Nav.Link href="/#expect_more">Expect More</Nav.Link>
					<Nav.Link href="/#service">Service & Repair</Nav.Link>
					<Nav.Link href="/#inventory">Inventory</Nav.Link>
					
					{/* Location Dropdown without Icons */}
					<NavDropdown 
						title="Location" 
						id="location-dropdown" 
						className="location-nav-dropdown"
						renderMenuOnMount={true}
					>
						<NavDropdown.Item href="/#location">
							Knoxville Dealership (Main Lot)
						</NavDropdown.Item>
						<NavDropdown.Divider />
						<NavDropdown.Item href="/buy-here-pay-here-knoxville-tn">
							Buy Here Pay Here Knoxville TN
						</NavDropdown.Item>
						<NavDropdown.Item href="/bad-credit-car-loans-knoxville">
							Bad Credit Car Loans Knoxville
						</NavDropdown.Item>
						<NavDropdown.Item href="/used-cars-knoxville">
							Used Cars Knoxville
						</NavDropdown.Item>
					</NavDropdown>

					<Nav.Link href="/#blog">Blog</Nav.Link>
				</Nav>
			</Navbar.Collapse>
		</Container>
	</Navbar>
    )
}

export default NavBar;
