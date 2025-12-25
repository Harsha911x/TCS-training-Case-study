package com.web;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.bean.Bakery;
import com.service.BakeryService;

@WebServlet("/BakeryServlet")
public class BakeryServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	public BakeryServlet() {
		super();
	}

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		BakeryService service = new BakeryService();
		PrintWriter pw = response.getWriter();
		String action = request.getParameter("action");

		pw.print("<h1 align='center'>Bakery Managmenet System</h1>");
		pw.print("<hr>");

		if (action != null && action.equals("List")) {

			List<Bakery> custList = service.getBakeryList();
			pw.print("<h2 align='center'>Bakery List</h2>");
			pw.print("<table border='1' align='center' width='80%'>");
			pw.print("<tr><th>Item Id</th><th>Name</th><th>Price</th><th>Category</th><th>Description</th><th>Stock Quantity</th></tr>");

			for (Bakery c : custList) {
				pw.print("<tr>");
				pw.print("<td>" + c.getItemId() + "</td>");
				pw.print("<td>" + c.getname() + "</td>");
				pw.print("<td>" + c.getprice() + "</td>");
				pw.print("<td>" + c.getcategory() + "</td>");
				pw.print("<td>" + c.getdescription() + "</td>");
				pw.print("<td>" + c.getstockquantity() + "</td>");
				
				pw.print("</tr>");
			}

			pw.print("</table>");

		} else {
			String custId = request.getParameter("ItemId");
			Bakery cust = service.getBakeryDetails(Integer.parseInt(custId));

			pw.print("<h2 align='center'>Bakery Search</h2>");

			if (cust == null) {
				pw.print("<p align='center'><font color='red'>Bakery not exist!</font></p>");
			} else {
				pw.print("<table border='1' align='center' width='30%'>");
				pw.print("<tr><td>Item Id</td><td>" + cust.getItemId() + "</td></tr>");
				pw.print("<tr><td>name</td><td>" + cust.getname() + "</td></tr>");
				pw.print("<tr><td>price</td><td>" + cust.getprice() + "</td></tr>");
				pw.print("<tr><td>category</td><td>" + cust.getcategory() + "</td></tr>");
				pw.print("<tr><td>description</td><td>" + cust.getdescription() + "</td></tr>");
				pw.print("<tr><td>stockquantity</td><td>" + cust.getstockquantity() + "</td></tr>");
				pw.print("</table>");
			}
		}

		pw.print("<p align='center'><a href='index.html'>Back</a></p>");
	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		String action = request.getParameter("action");
		BakeryService service = new BakeryService();
		PrintWriter pw = response.getWriter();

		pw.print("<h1 align='center'>Bakery Managmenet System</h1>");
		pw.print("<hr>");

		/* ---------------- INSERT Bakery ---------------- */
		if (action == null || action.equals("Register")) {

			String ItemId = request.getParameter("ItemId");
			String name = request.getParameter("name");
			String price = request.getParameter("price");
			String category = request.getParameter("category");
			String description = request.getParameter("description");
			String stockquantity = request.getParameter("stockquantity");
			

			Bakery cust = new Bakery(Integer.parseInt(ItemId), name, Double.parseDouble(price),category,description,Integer.parseInt(stockquantity));
			
			System.out.print("&&&&&&&&&"+stockquantity);

			boolean result = service.insertBakery(cust);

			if (result) {
				pw.print("<p align='center'><font color='green'>Bakery insertion successful.</font></p>");
			} else {
				pw.print("<p align='center'><font color='red'>Bakery insertion failed!</font></p>");
			}
		}
		
		       pw.print("<p align='center'><a href='index.html'>Back</a></p>");
	}
}