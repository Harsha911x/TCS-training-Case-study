package com.bean;

public class Bakery {
	int ItemId;
	String name;
	double price;
	String category;
	String description;
	int stockquantity;
	
	public int getItemId() {
		return ItemId;
	}
	public void setItemId(int ItemId) {
		this.ItemId = ItemId;
	}
	public String getname() {
		return name;
	}
	public void setname(String name) {
		this.name = name;
	}
	public double getprice() {
		return price;
	}
	public void setprice(double price) {
		this.price = price;
	}
	public String getcategory() {
		return category;
	}
	public void setcategory() {
		this.category=category;
	}
	public String getdescription() {
		return description;
	}
	public void setdescription() {
		this.description=description;
	}
	
	public int getstockquantity() {
		return stockquantity;
	}
	public void setstockquantity() {
		this.stockquantity=stockquantity;
	}
	
	
	public Bakery(int ItemId, String name, double price, String category, String description, int stockquantity) {
		super();
		this.ItemId = ItemId;
		this.name = name;
		this.price = price;
		this.category=category;
		this.description=description;
		this.stockquantity=stockquantity;
	}
	public Bakery() {
		super();
	}
	
}