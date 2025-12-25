package com.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class DBUtil {
	public static Connection getConnection() {
		Connection cn=null;
		try {
			Class.forName("org.apache.derby.jdbc.EmbeddedDriver");
			cn=DriverManager.getConnection("jdbc:derby:C:\\Users\\2871239\\MyDB;create=true");
		} catch(ClassNotFoundException e) {
			System.out.println(e.getMessage());
		} catch(SQLException e) {
			System.out.println(e.getMessage());
		}
		return cn;
	}
	
	public static void closeAllConnection(Connection cn, PreparedStatement ps, ResultSet rs) {
		try {
			if(rs!=null) {
				rs.close();
			}
			if(ps!=null) {
				ps.close();
			}
			if(cn!=null) {
				cn.close();
			}
		} catch(SQLException e) {
			System.out.println(e.getMessage());
		}
	}
}