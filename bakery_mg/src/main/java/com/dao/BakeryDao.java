package com.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.bean.Bakery;
import com.util.DBUtil;

public class BakeryDao {
	public List<Bakery> getBakeryList() {
		List<Bakery> BakeryList=new ArrayList<Bakery>();
		try {
			Connection cn=DBUtil.getConnection();
			PreparedStatement ps=cn.prepareStatement("SELECT * FROM Bakeryss");
			ResultSet rs=ps.executeQuery();
			while(rs.next()) {
				Bakery c=new Bakery(rs.getInt("ItemId"), rs.getString("name"), rs.getDouble("price"),rs.getString("category"),rs.getString("description"),rs.getInt("stockquantity"));
				BakeryList.add(c);
			}
			DBUtil.closeAllConnection(cn, ps, rs);
		} catch(SQLException e) {
			System.out.println(e.getMessage());
		}
		return BakeryList;
	}

	public Bakery getBakeryDetails(int ItemId) {
		Bakery result=null;
		try {
			Connection cn=DBUtil.getConnection();
			PreparedStatement ps=cn.prepareStatement("SELECT * FROM Bakeryss WHERE ItemId=?");
			ps.setInt(1, ItemId);
			ResultSet rs=ps.executeQuery();
			while(rs.next()) {
				result=new Bakery(rs.getInt("ItemId"), rs.getString("name"), rs.getDouble("price"),rs.getString("category"),rs.getString("description"),rs.getInt("stockquantity"));
			}
			DBUtil.closeAllConnection(cn, ps, rs);
		} catch(SQLException e) {
			System.out.println(e.getMessage());
		}
		return result;
	}

	public boolean insertBakery(Bakery cust) {
		boolean result=false;
		try {
			System.out.print("&&&&&&&&&"+cust.getItemId());
			Connection cn=DBUtil.getConnection();
			PreparedStatement ps=cn.prepareStatement("INSERT INTO Bakeryss VALUES(?,?,?,?,?,?)");
			ps.setInt(1, cust.getItemId());
			ps.setString(2, cust.getname());
			ps.setDouble(3, cust.getprice());
			ps.setString(4, cust.getcategory());
			ps.setString(5, cust.getdescription());
			ps.setInt(6, cust.getstockquantity());
			
			int t=ps.executeUpdate();
			if(t>0) {
				result=true;
			}
			DBUtil.closeAllConnection(cn, ps, null);
		} catch(SQLException e) {
			System.out.println(e.getMessage());
		}
		return result;
	}
}
